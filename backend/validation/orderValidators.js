const { body, param, query } = require("express-validator");

const createOrderValidator = [
  body("shipping_address_id").isInt({ min: 1 }),
  body("billing_address_id").optional({ nullable: true }).isInt({ min: 1 }),
  body("coupon_id").optional({ nullable: true }).isInt({ min: 1 }),
  body("notes").optional({ nullable: true }).isLength({ max: 2000 }),
];

const orderListValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status")
    .optional()
    .isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"]),
];

const orderIdValidator = [param("id").isUUID()];

const cancelOrderValidator = [...orderIdValidator, body("reason").optional({ nullable: true }).isLength({ max: 1000 })];

const updateOrderStatusValidator = [
  ...orderIdValidator,
  body("status").isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"]),
];

const sellerOrderIdValidator = [param("id").isInt({ min: 1 })];

const sellerAssignShipperValidator = [
  ...sellerOrderIdValidator,
  body("shipper_id").isUUID(),
  body("carrier").optional({ nullable: true }).isLength({ max: 100 }),
  body("tracking_number").optional({ nullable: true }).isLength({ max: 100 }),
  body("estimated_delivery_date").optional({ nullable: true }).isISO8601(),
  body("notes").optional({ nullable: true }).isLength({ max: 1000 }),
];

module.exports = {
  createOrderValidator,
  orderListValidator,
  orderIdValidator,
  cancelOrderValidator,
  updateOrderStatusValidator,
  sellerOrderIdValidator,
  sellerAssignShipperValidator,
};
