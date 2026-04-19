const express = require("express");
const router = express.Router();
const inventoryController = require("../controller/inventoryController");
const { authenticate, authorize } = require("../utils/authMiddleware");

router.get("/product/:productId", authenticate, authorize("admin", "seller"), inventoryController.getInventory);
router.put("/:id", authenticate, authorize("admin", "seller"), inventoryController.updateInventory);
router.get("/low-stock", authenticate, authorize("admin"), inventoryController.getLowStock);

module.exports = router;
