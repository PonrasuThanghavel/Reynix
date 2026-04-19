const toNumber = (value) => Number.parseFloat(value || 0);

const groupCartItemsBySeller = (items) => {
  const grouped = new Map();

  for (const item of items) {
    const sellerId = item.product?.seller_id;
    if (!sellerId) {
      throw new Error(`Product ${item.product_id} is not assigned to a seller`);
    }

    if (!grouped.has(sellerId)) grouped.set(sellerId, []);
    grouped.get(sellerId).push(item);
  }

  return grouped;
};

const calculateCouponDiscount = (subtotal, coupon) => {
  if (!coupon) return 0;

  const orderSubtotal = toNumber(subtotal);
  const discountValue = toNumber(coupon.discount_value);

  if (coupon.discount_type === "flat") return Math.min(orderSubtotal, discountValue);

  const discount = (orderSubtotal * discountValue) / 100;
  const cap = coupon.max_discount_cap ? toNumber(coupon.max_discount_cap) : orderSubtotal;
  return Math.min(discount, cap);
};

const deriveOrderStatus = (sellerOrders) => {
  if (!sellerOrders.length) return "pending";
  if (sellerOrders.every((sellerOrder) => sellerOrder.status === "cancelled")) return "cancelled";
  if (sellerOrders.every((sellerOrder) => sellerOrder.status === "delivered")) return "delivered";
  if (sellerOrders.some((sellerOrder) => ["shipped", "delivered"].includes(sellerOrder.status))) return "shipped";
  if (sellerOrders.some((sellerOrder) => ["packed", "assigned"].includes(sellerOrder.status))) return "processing";
  return "pending";
};

module.exports = {
  toNumber,
  groupCartItemsBySeller,
  calculateCouponDiscount,
  deriveOrderStatus,
};
