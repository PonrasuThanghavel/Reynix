const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const { authenticate, authorize } = require("../utils/authMiddleware");

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", authenticate, authorize("admin"), categoryController.createCategory);
router.put("/:id", authenticate, authorize("admin"), categoryController.updateCategory);
router.delete("/:id", authenticate, authorize("admin"), categoryController.deleteCategory);

module.exports = router;
