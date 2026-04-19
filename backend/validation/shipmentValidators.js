const { body, param } = require("express-validator");

const shipmentIdValidator = [param("id").isInt({ min: 1 })];
const shipmentOrderIdValidator = [param("orderId").isUUID()];

const updateShipmentValidator = [
  ...shipmentIdValidator,
  body("tracking_number").optional({ nullable: true }).isLength({ max: 100 }),
  body("carrier").optional({ nullable: true }).isLength({ max: 100 }),
  body("status").optional().isIn(["pending", "dispatched", "in_transit", "out_for_delivery", "delivered", "failed"]),
  body("estimated_delivery_date").optional({ nullable: true }).isISO8601(),
  body("shipping_label_url").optional({ nullable: true }).isURL(),
  body("notes").optional({ nullable: true }).isLength({ max: 1000 }),
  body("shipper_id").optional({ nullable: true }).isUUID(),
];

const shipperUpdateShipmentStatusValidator = [
  ...shipmentIdValidator,
  body("status").isIn(["dispatched", "in_transit", "out_for_delivery", "failed"]),
  body("notes").optional({ nullable: true }).isLength({ max: 1000 }),
];

const shipperConfirmShipmentValidator = [
  ...shipmentIdValidator,
  body("otp").isLength({ min: 6, max: 6 }).isNumeric(),
];

module.exports = {
  shipmentIdValidator,
  shipmentOrderIdValidator,
  updateShipmentValidator,
  shipperUpdateShipmentStatusValidator,
  shipperConfirmShipmentValidator,
};
