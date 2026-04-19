const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");
const { authenticate, authorize } = require("../utils/authMiddleware");

router.use(authenticate);

router.post("/", paymentController.createPayment);
router.get("/order/:orderId", paymentController.getPaymentsByOrder);
router.put("/:id/status", authorize("admin"), paymentController.updatePaymentStatus);

module.exports = router;
