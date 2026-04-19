const express = require("express");
const router = express.Router();
const sellerController = require("../controller/sellerController");
const { authenticate, authorize } = require("../utils/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  orderListValidator,
  sellerOrderIdValidator,
  sellerAssignShipperValidator,
} = require("../validation/orderValidators");

router.use(authenticate, authorize("seller"));

router.get("/orders", orderListValidator, validateRequest(["query"]), sellerController.getSellerOrders);
router.put("/orders/:id/pack", sellerOrderIdValidator, validateRequest(["params"]), sellerController.packOrder);
router.put(
  "/orders/:id/assign-shipper",
  sellerAssignShipperValidator,
  validateRequest(["params", "body"]),
  sellerController.assignShipper
);

module.exports = router;
