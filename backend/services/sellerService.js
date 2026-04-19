const { sequelize } = require("../config/database");
const { SellerOrder, Order, OrderItem, Shipment, UserAddress, User, Notification } = require("../model");
const AppError = require("../utils/appError");
const { generateDeliveryOtp, hashOtp } = require("../utils/otp");
const domainEvents = require("../events/domainEvents");
const { syncOrderStatus } = require("./orderService");

const getSellerOrder = async (sellerId, sellerOrderId, transaction) => {
  const sellerOrder = await SellerOrder.findOne({
    where: { id: sellerOrderId, seller_id: sellerId },
    include: [
      { model: Order, as: "order", include: [{ model: UserAddress, as: "shippingAddress" }] },
      { model: OrderItem, as: "items" },
      { model: Shipment, as: "shipment" },
    ],
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });

  if (!sellerOrder) throw new AppError("Seller order not found", 404, "SELLER_ORDER_NOT_FOUND");
  return sellerOrder;
};

const getSellerOrders = async (sellerId, query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 20;
  const offset = (page - 1) * limit;
  const where = { seller_id: sellerId };
  if (query.status) where.status = query.status;

  const { count, rows } = await SellerOrder.findAndCountAll({
    where,
    include: [
      { model: Order, as: "order", include: [{ model: UserAddress, as: "shippingAddress" }] },
      { model: OrderItem, as: "items" },
      { model: Shipment, as: "shipment" },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    sellerOrders: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

const packSellerOrder = async (sellerId, sellerOrderId) => {
  const transaction = await sequelize.transaction();
  try {
    const sellerOrder = await getSellerOrder(sellerId, sellerOrderId, transaction);
    if (sellerOrder.status !== "pending") {
      throw new AppError("Only pending seller orders can be packed", 400, "SELLER_ORDER_INVALID_STATE");
    }

    await sellerOrder.update({ status: "packed" }, { transaction });
    await syncOrderStatus(sellerOrder.order_id, transaction);
    await transaction.commit();

    domainEvents.emit("seller_order.packed", { sellerOrderId, sellerId });
    return sellerOrder;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const assignShipper = async (sellerId, sellerOrderId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    const sellerOrder = await getSellerOrder(sellerId, sellerOrderId, transaction);
    if (!["packed", "assigned"].includes(sellerOrder.status)) {
      throw new AppError("Seller order must be packed before assigning a shipper", 400, "SELLER_ORDER_NOT_PACKED");
    }

    const shipper = await User.findOne({
      where: { id: payload.shipper_id, role: "shipper", is_active: true },
      transaction,
    });
    if (!shipper) throw new AppError("Shipper not found", 404, "SHIPPER_NOT_FOUND");

    const otp = generateDeliveryOtp();
    const otpHash = await hashOtp(otp);

    const shipment = sellerOrder.shipment
      ? sellerOrder.shipment
      : await Shipment.create(
          { order_id: sellerOrder.order_id, seller_order_id: sellerOrder.id, status: "pending" },
          { transaction }
        );

    await shipment.update(
      {
        shipper_id: shipper.id,
        assigned_at: new Date(),
        delivery_otp: otpHash,
        delivery_confirmed: false,
        tracking_number: payload.tracking_number ?? shipment.tracking_number,
        carrier: payload.carrier ?? shipment.carrier,
        estimated_delivery_date: payload.estimated_delivery_date ?? shipment.estimated_delivery_date,
        notes: payload.notes ?? shipment.notes,
        status: "dispatched",
      },
      { transaction }
    );

    await sellerOrder.update({ status: "assigned" }, { transaction });
    await syncOrderStatus(sellerOrder.order_id, transaction);

    await Notification.bulkCreate(
      [
        {
          user_id: shipper.id,
          type: "shipment_update",
          title: "New shipment assigned",
          message: `Shipment ${shipment.id} has been assigned to you`,
          reference_id: sellerOrder.order_id,
          reference_type: "shipment",
        },
        {
          user_id: sellerOrder.order.user_id,
          type: "shipment_update",
          title: "Shipment assigned",
          message: `A shipper has been assigned to order ${sellerOrder.order.order_number}`,
          reference_id: sellerOrder.order_id,
          reference_type: "order",
        },
      ],
      { transaction }
    );

    await transaction.commit();
    domainEvents.emit("shipment.assigned", { shipmentId: shipment.id, sellerOrderId, shipperId: shipper.id });
    return { sellerOrderId: sellerOrder.id, shipmentId: shipment.id, deliveryOtp: otp };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getSellerOrders,
  packSellerOrder,
  assignShipper,
};
