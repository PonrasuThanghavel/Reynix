const express = require("express");
const router = express.Router();
const wishlistController = require("../controller/wishlistController");
const { authenticate } = require("../utils/authMiddleware");

router.use(authenticate);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addToWishlist);
router.delete("/:id", wishlistController.removeFromWishlist);

module.exports = router;
