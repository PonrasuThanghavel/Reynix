const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const { authenticate, authorize } = require("../utils/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  productIdValidator,
  productListValidator,
  createProductValidator,
  updateProductValidator,
} = require("../validation/productValidators");

router.get("/", productListValidator, validateRequest(["query"]), productController.getProducts);
router.get("/:id", productController.getProductById);
router.post(
  "/",
  authenticate,
  authorize("admin", "seller"),
  createProductValidator,
  validateRequest(["body"]),
  productController.createProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "seller"),
  updateProductValidator,
  validateRequest(["params", "body"]),
  productController.updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "seller"),
  productIdValidator,
  validateRequest(["params"]),
  productController.deleteProduct
);

module.exports = router;
