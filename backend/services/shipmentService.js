const { sequelize } = require("../config/database");
const { Shipment, Order, UserAddress, SellerOrder, OrderItem, User, Notification } = require("../model");
const AppError = require("../utils/appError");
const { verifyOtp } = require("../utils/otp");
const domainEvents = require("../events/domainEvents");
const { syncOrderStatus } = require("./orderService");

const shipmentIncludes = [
  {
    model: SellerOrder,
    as: "sellerOrder",
    include: [
      { model: Order, as: "order", include: [{ model: UserAddress, as: "shippingAddress" }] },
      { model: OrderItem, as: "items" },
      { model: User, as: "seller", attributes: ["id", "full_name", "email"] },
    ],
  },
  { model: User, as: "shipper", attributes: ["id", "full_name", "email"] },
];

const getShipmentByOrder = async (orderId, user) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");

  const where = { order_id: orderId };
  if (user.role === "customer" && order.user_id !== user.id) {
    throw new AppError("Access denied", 403, "SHIPMENT_ACCESS_DENIED");
  }
  if (user.role === "shipper") where.shipper_id = user.id;

  const shipments = await Shipment.findAll({
    where,
    include: shipmentIncludes,
    order: [["created_at", "ASC"]],
  });

  if (user.role === "seller" && !shipments.some((shipment) => shipment.sellerOrder?.seller_id === user.id)) {
    throw new AppError("Access denied", 403, "SHIPMENT_ACCESS_DENIED");
  }
  if (!shipments.length) throw new AppError("Shipment not found", 404, "SHIPMENT_NOT_FOUND");
  return { shipment: shipments[0], shipments };
};

const adminUpdateShipment = async (shipmentId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    const shipment = await Shipment.findByPk(shipmentId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!shipment) throw new AppError("Shipment not found", 404, "SHIPMENT_NOT_FOUND");

    const updateData = { ...payload };
    if (payload.status === "delivered") {
      updateData.delivered_at = new Date();
      updateData.delivery_confirmed = true;
      await SellerOrder.update({ status: "delivered" }, { where: { id: shipment.seller_order_id }, transaction });
    }
    if (payload.status === "dispatched") {
      await SellerOrder.update({ status: "shipped" }, { where: { id: shipment.seller_order_id }, transaction });
    }

    await shipment.update(updateData, { transaction });
    await syncOrderStatus(shipment.order_id, transaction);
    await transaction.commit();
    return shipment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAssignedShipments = async (shipperId) =>
  Shipment.findAll({
    where: { shipper_id: shipperId },
    include: shipmentIncludes,
    order: [["assigned_at", "DESC"]],
  });

const getShipmentForShipper = async (shipperId, shipmentId) => {
  const shipment = await Shipment.findOne({
    where: { id: shipmentId, shipper_id: shipperId },
    include: shipmentIncludes,
  });
  if (!shipment) throw new AppError("Shipment not found", 404, "SHIPPER_SHIPMENT_NOT_FOUND");

  const shipmentJson = shipment.toJSON();
  const address = shipmentJson.sellerOrder?.order?.shippingAddress;

  return {
    id: shipmentJson.id,
    status: shipmentJson.status,
    tracking_number: shipmentJson.tracking_number,
    carrier: shipmentJson.carrier,
    assigned_at: shipmentJson.assigned_at,
    estimated_delivery_date: shipmentJson.estimated_delivery_date,
    delivered_at: shipmentJson.delivered_at,
    items: shipmentJson.sellerOrder?.items || [],
    delivery_address: address
      ? {
          full_name: address.full_name,
          phone_number: address.phone_number,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
        }
      : null,
  };
};

const updateShipmentStatus = async (shipperId, shipmentId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    const shipment = await Shipment.findOne({
      where: { id: shipmentId, shipper_id: shipperId },
      include: [{ model: SellerOrder, as: "sellerOrder" }],
      transaction,
    });
    if (!shipment) throw new AppError("Shipment not found", 404, "SHIPPER_SHIPMENT_NOT_FOUND");
    if (shipment.delivery_confirmed) {
      throw new AppError("Delivered shipments cannot be updated", 400, "SHIPMENT_ALREADY_CONFIRMED");
    }

    await shipment.update({ status: payload.status, notes: payload.notes ?? shipment.notes }, { transaction });

    const sellerOrderStatus = payload.status === "dispatched" ? "assigned" : "shipped";
    await SellerOrder.update({ status: sellerOrderStatus }, { where: { id: shipment.seller_order_id }, transaction });
    await syncOrderStatus(shipment.order_id, transaction);

    await transaction.commit();
    domainEvents.emit("shipment.status_updated", { shipmentId, shipperId, status: payload.status });
    return shipment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const confirmShipmentDelivery = async (shipperId, shipmentId, otp) => {
  const transaction = await sequelize.transaction();
  try {
    const shipment = await Shipment.findOne({
      where: { id: shipmentId, shipper_id: shipperId },
      include: [{ model: SellerOrder, as: "sellerOrder", include: [{ model: Order, as: "order" }] }],
      transaction,
    });
    if (!shipment) throw new AppError("Shipment not found", 404, "SHIPPER_SHIPMENT_NOT_FOUND");
    if (!shipment.delivery_otp) throw new AppError("Shipment OTP is unavailable", 400, "SHIPMENT_OTP_MISSING");

    const isValidOtp = await verifyOtp(otp, shipment.delivery_otp);
    if (!isValidOtp) throw new AppError("Invalid delivery OTP", 400, "INVALID_DELIVERY_OTP");

    await shipment.update(
      {
        status: "delivered",
        delivery_confirmed: true,
        delivered_at: new Date(),
      },
      { transaction }
    );
    await SellerOrder.update({ status: "delivered" }, { where: { id: shipment.seller_order_id }, transaction });
    await syncOrderStatus(shipment.order_id, transaction);

    await Notification.create(
      {
        user_id: shipment.sellerOrder.order.user_id,
        type: "shipment_update",
        title: "Order delivered",
        message: `Shipment ${shipment.id} has been delivered successfully`,
        reference_id: shipment.order_id,
        reference_type: "order",
      },
      { transaction }
    );

    await transaction.commit();
    domainEvents.emit("shipment.delivered", { shipmentId, shipperId });
    return shipment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  getShipmentByOrder,
  adminUpdateShipment,
  getAssignedShipments,
  getShipmentForShipper,
  updateShipmentStatus,
  confirmShipmentDelivery,
};
