const express = require("express");
const router = express.Router();
const shipmentController = require("../controller/shipmentController");
const { authenticate, authorize } = require("../utils/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { shipmentOrderIdValidator, updateShipmentValidator } = require("../validation/shipmentValidators");

router.get(
  "/order/:orderId",
  authenticate,
  shipmentOrderIdValidator,
  validateRequest(["params"]),
  shipmentController.getShipmentByOrder
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateShipmentValidator,
  validateRequest(["params", "body"]),
  shipmentController.updateShipment
);

module.exports = router;
