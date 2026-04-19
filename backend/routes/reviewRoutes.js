const express = require("express");
const router = express.Router();
const reviewController = require("../controller/reviewController");
const { authenticate } = require("../utils/authMiddleware");

router.get("/product/:productId", reviewController.getProductReviews);
router.post("/", authenticate, reviewController.createReview);
router.delete("/:id", authenticate, reviewController.deleteReview);

module.exports = router;
