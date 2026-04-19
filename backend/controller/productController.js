const productService = require("../services/productService");
const { apiResponse } = require("../utils/helpers");

// Get all products (with filters & pagination)
exports.getProducts = async (req, res, next) => {
  try {
    const data = await productService.getProducts(req.query, req.user);
    apiResponse(res, 200, true, "Products fetched", data);
  } catch (error) {
    next(error);
  }
};

// Get product by ID or slug
exports.getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id, req.user);
    apiResponse(res, 200, true, "Product fetched", { product });
  } catch (error) {
    next(error);
  }
};

// Create product (admin/seller)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user);
    apiResponse(res, 201, true, "Product created", { product });
  } catch (error) {
    next(error);
  }
};

// Update product (admin/seller)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.user);
    apiResponse(res, 200, true, "Product updated", { product });
  } catch (error) {
    next(error);
  }
};

// Soft delete product (admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id, req.user);
    apiResponse(res, 200, true, "Product deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
