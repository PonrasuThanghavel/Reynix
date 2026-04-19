const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");
const { authenticate } = require("../utils/authMiddleware");

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.put("/items/:itemId", cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/clear", cartController.clearCart);

module.exports = router;
