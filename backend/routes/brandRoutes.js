const express = require("express");
const router = express.Router();
const brandController = require("../controller/brandController");
const { authenticate, authorize } = require("../utils/authMiddleware");

router.get("/", brandController.getBrands);
router.get("/:id", brandController.getBrandById);
router.post("/", authenticate, authorize("admin"), brandController.createBrand);
router.put("/:id", authenticate, authorize("admin"), brandController.updateBrand);
router.delete("/:id", authenticate, authorize("admin"), brandController.deleteBrand);

module.exports = router;
