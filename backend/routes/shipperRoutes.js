const express = require("express");
const router = express.Router();
const shipperController = require("../controller/shipperController");
const { authenticate, authorize } = require("../utils/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  shipmentIdValidator,
  shipperUpdateShipmentStatusValidator,
  shipperConfirmShipmentValidator,
} = require("../validation/shipmentValidators");

router.use(authenticate, authorize("shipper"));

router.get("/shipments", shipperController.getShipments);
router.get("/shipments/:id", shipmentIdValidator, validateRequest(["params"]), shipperController.getShipmentById);
router.put(
  "/shipments/:id/status",
  shipperUpdateShipmentStatusValidator,
  validateRequest(["params", "body"]),
  shipperController.updateShipmentStatus
);
router.put(
  "/shipments/:id/confirm",
  shipperConfirmShipmentValidator,
  validateRequest(["params", "body"]),
  shipperController.confirmShipment
);

module.exports = router;
