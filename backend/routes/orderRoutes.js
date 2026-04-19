const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const { authenticate, authorize } = require("../utils/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createOrderValidator,
  orderListValidator,
  orderIdValidator,
  cancelOrderValidator,
  updateOrderStatusValidator,
} = require("../validation/orderValidators");

router.use(authenticate);

router.post("/", createOrderValidator, validateRequest(["body"]), orderController.createOrder);
router.get("/", orderListValidator, validateRequest(["query"]), orderController.getOrders);
router.get("/:id", orderIdValidator, validateRequest(["params"]), orderController.getOrderById);
router.put("/:id/cancel", cancelOrderValidator, validateRequest(["params", "body"]), orderController.cancelOrder);
router.put("/:id/status", authorize("admin"), updateOrderStatusValidator, validateRequest(["params", "body"]), orderController.updateOrderStatus);

module.exports = router;
