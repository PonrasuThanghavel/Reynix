const { sequelize } = require("../config/database");
const {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  Inventory,
  UserAddress,
  Shipment,
  Coupon,
  SellerOrder,
  User,
  Notification,
} = require("../model");
const AppError = require("../utils/appError");
const { generateOrderNumber } = require("../utils/helpers");
const domainEvents = require("../events/domainEvents");
const {
  toNumber,
  groupCartItemsBySeller,
  calculateCouponDiscount,
  deriveOrderStatus,
} = require("./orderService.helpers");

const baseOrderIncludes = [
  {
    model: OrderItem,
    as: "items",
    include: [{ model: Product, as: "product", attributes: ["id", "name", "seller_id"] }],
  },
  {
    model: SellerOrder,
    as: "sellerOrders",
    include: [
      { model: User, as: "seller", attributes: ["id", "full_name", "email"] },
      { model: Shipment, as: "shipment" },
      { model: OrderItem, as: "items" },
    ],
  },
];

const loadInventory = (item, transaction) =>
  Inventory.findOne({
    where: item.variant_id ? { variant_id: item.variant_id } : { product_id: item.product_id, variant_id: null },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

const syncOrderStatus = async (orderId, transaction) => {
  const sellerOrders = await SellerOrder.findAll({ where: { order_id: orderId }, transaction });
  const status = deriveOrderStatus(sellerOrders);
  await Order.update({ status }, { where: { id: orderId }, transaction });
  return status;
};

const validateCoupon = async (couponId, subtotal, transaction) => {
  if (!couponId) return null;

  const coupon = await Coupon.findByPk(couponId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!coupon) throw new AppError("Coupon not found", 404, "COUPON_NOT_FOUND");
  if (!coupon.is_active) throw new AppError("Coupon is inactive", 400, "COUPON_INACTIVE");

  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    throw new AppError("Coupon is not active yet", 400, "COUPON_NOT_STARTED");
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    throw new AppError("Coupon has expired", 400, "COUPON_EXPIRED");
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    throw new AppError("Coupon usage limit reached", 400, "COUPON_USAGE_LIMIT_REACHED");
  }
  if (toNumber(subtotal) < toNumber(coupon.min_order_amount)) {
    throw new AppError("Order does not meet coupon minimum amount", 400, "COUPON_MIN_ORDER_NOT_MET");
  }

  return coupon;
};

const getOrderById = async (user, orderId) => {
  const where = { id: orderId };
  if (user.role !== "admin") where.user_id = user.id;

  const order = await Order.findOne({
    where,
    include: [
      ...baseOrderIncludes,
      { model: Shipment, as: "shipments" },
      { model: UserAddress, as: "shippingAddress" },
      { model: UserAddress, as: "billingAddress" },
    ],
  });

  if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");

  const orderJson = order.toJSON();
  if (!orderJson.shipment && orderJson.shipments?.length) {
    orderJson.shipment = orderJson.shipments[0];
  }

  return orderJson;
};

const createOrder = async (user, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const { shipping_address_id, billing_address_id, coupon_id, notes } = payload;

    const shippingAddress = await UserAddress.findOne({
      where: { id: shipping_address_id, user_id: user.id },
      transaction,
    });
    if (!shippingAddress) throw new AppError("Shipping address not found", 404, "SHIPPING_ADDRESS_NOT_FOUND");

    if (billing_address_id) {
      const billingAddress = await UserAddress.findOne({
        where: { id: billing_address_id, user_id: user.id },
        transaction,
      });
      if (!billingAddress) throw new AppError("Billing address not found", 404, "BILLING_ADDRESS_NOT_FOUND");
    }

    const cart = await Cart.findOne({
      where: { user_id: user.id, status: "active" },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            { model: Product, as: "product" },
            { model: ProductVariant, as: "variant" },
          ],
        },
      ],
      transaction,
    });

    if (!cart || !cart.items.length) throw new AppError("Cart is empty", 400, "CART_EMPTY");

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product || item.product.deleted_at || item.product.status !== "active") {
        throw new AppError(`Product ${item.product_id} is unavailable`, 400, "PRODUCT_UNAVAILABLE");
      }
      if (!item.product.seller_id) {
        throw new AppError(`Product ${item.product_id} is not assigned to a seller`, 400, "PRODUCT_SELLER_MISSING");
      }

      const inventory = await loadInventory(item, transaction);
      if (!inventory) throw new AppError("Inventory not found", 400, "INVENTORY_NOT_FOUND");
      if (inventory.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400, "INSUFFICIENT_STOCK");
      }

      const unitPrice = item.variant ? toNumber(item.variant.selling_price) : toNumber(item.product.selling_price);
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product.name,
        variant_name: item.variant?.variant_name || null,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount_amount: 0,
        tax_amount: 0,
        total_price: totalPrice,
        seller_id: item.product.seller_id,
      });

      await inventory.decrement("quantity", { by: item.quantity, transaction });
    }

    const groupedItems = groupCartItemsBySeller(cart.items.map((item) => item.toJSON()));

    const coupon = await validateCoupon(coupon_id, subtotal, transaction);
    const discount_amount = calculateCouponDiscount(subtotal, coupon);
    if (coupon) await coupon.increment("usage_count", { transaction });

    const tax_amount = Number((subtotal * 0.18).toFixed(2));
    const total_amount = Number((subtotal - discount_amount + tax_amount).toFixed(2));

    const order = await Order.create(
      {
        user_id: user.id,
        order_number: generateOrderNumber(),
        status: "pending",
        shipping_address_id,
        billing_address_id,
        coupon_id,
        subtotal,
        discount_amount,
        tax_amount,
        shipping_charge: 0,
        total_amount,
        notes,
      },
      { transaction }
    );

    const sellerOrderIds = new Map();
    for (const [sellerId] of groupedItems.entries()) {
      const sellerOrder = await SellerOrder.create(
        { order_id: order.id, seller_id: sellerId, status: "pending" },
        { transaction }
      );
      sellerOrderIds.set(sellerId, sellerOrder.id);

      await Shipment.create(
        {
          order_id: order.id,
          seller_order_id: sellerOrder.id,
          status: "pending",
          delivery_confirmed: false,
        },
        { transaction }
      );
    }

    await OrderItem.bulkCreate(
      orderItems.map((item) => ({
        ...item,
        order_id: order.id,
        seller_order_id: sellerOrderIds.get(item.seller_id),
      })),
      { transaction }
    );

    await cart.update({ status: "merged" }, { transaction });
    await CartItem.destroy({ where: { cart_id: cart.id }, transaction });

    await Notification.bulkCreate(
      Array.from(groupedItems.keys()).map((sellerId) => ({
        user_id: sellerId,
        type: "order_update",
        title: "New order received",
        message: `A new seller order is waiting for action on order ${order.order_number}`,
        reference_id: order.id,
        reference_type: "order",
      })),
      { transaction }
    );

    await transaction.commit();
    domainEvents.emit("order.created", { orderId: order.id, sellerIds: Array.from(groupedItems.keys()) });
    return getOrderById(user, order.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getOrders = async (user, query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const where = user.role === "admin" ? {} : { user_id: user.id };
  if (query.status) where.status = query.status;

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: baseOrderIncludes,
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  return {
    orders: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

const cancelOrder = async (user, orderId, reason) => {
  const transaction = await sequelize.transaction();

  try {
    const where = { id: orderId };
    if (user.role !== "admin") where.user_id = user.id;

    const order = await Order.findOne({
      where,
      include: [
        { model: OrderItem, as: "items" },
        { model: SellerOrder, as: "sellerOrders" },
      ],
      transaction,
    });

    if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    const hasLockedFulfillment = order.sellerOrders.some((sellerOrder) =>
      ["shipped", "delivered"].includes(sellerOrder.status)
    );

    if (!["pending", "confirmed", "processing"].includes(order.status) || hasLockedFulfillment) {
      throw new AppError("Order cannot be cancelled at this stage", 400, "ORDER_CANNOT_BE_CANCELLED");
    }

    for (const item of order.items) {
      const inventory = await loadInventory(item, transaction);
      if (inventory) await inventory.increment("quantity", { by: item.quantity, transaction });
    }

    await order.update(
      { status: "cancelled", cancelled_at: new Date(), cancellation_reason: reason || null },
      { transaction }
    );
    await SellerOrder.update({ status: "cancelled" }, { where: { order_id: order.id }, transaction });
    await Shipment.update({ status: "failed" }, { where: { order_id: order.id }, transaction });

    await transaction.commit();
    domainEvents.emit("order.cancelled", { orderId: order.id });
    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  await order.update({ status });
  return order;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  syncOrderStatus,
};
