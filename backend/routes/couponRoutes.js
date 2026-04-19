const express = require("express");
const router = express.Router();
const couponController = require("../controller/couponController");
const { authenticate, authorize } = require("../utils/authMiddleware");

router.get("/", authenticate, couponController.getCoupons);
router.post("/validate", authenticate, couponController.validateCoupon);
router.post("/", authenticate, authorize("admin"), couponController.createCoupon);
router.put("/:id", authenticate, authorize("admin"), couponController.updateCoupon);
router.delete("/:id", authenticate, authorize("admin"), couponController.deleteCoupon);

module.exports = router;
