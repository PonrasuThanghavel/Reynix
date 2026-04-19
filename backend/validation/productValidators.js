const { body, param, query } = require("express-validator");

const productIdValidator = [param("id").isUUID()];

const productListValidator = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("category_id").optional().isInt({ min: 1 }),
  query("brand_id").optional().isInt({ min: 1 }),
  query("seller_id").optional().isUUID(),
  query("is_featured").optional().isBoolean(),
  query("min_price").optional().isFloat({ min: 0 }),
  query("max_price").optional().isFloat({ min: 0 }),
  query("sort").optional().isIn(["price_asc", "price_desc", "rating", "name"]),
];

const createProductValidator = [
  body("name").trim().isLength({ min: 2, max: 255 }),
  body("slug").optional().trim().isLength({ min: 2, max: 255 }),
  body("description").optional({ nullable: true }).isString(),
  body("short_description").optional({ nullable: true }).isLength({ max: 500 }),
  body("category_id").isInt({ min: 1 }),
  body("brand_id").optional({ nullable: true }).isInt({ min: 1 }),
  body("seller_id").optional({ nullable: true }).isUUID(),
  body("base_price").isFloat({ min: 0 }),
  body("selling_price").isFloat({ min: 0 }),
  body("discount_percent").optional().isFloat({ min: 0, max: 100 }),
  body("tax_percent").optional().isFloat({ min: 0, max: 100 }),
  body("sku").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("status").optional().isIn(["active", "draft", "archived"]),
  body("is_featured").optional().isBoolean(),
  body("tags").optional().isArray(),
  body("meta_title").optional({ nullable: true }).isLength({ max: 255 }),
  body("meta_description").optional({ nullable: true }).isString(),
  body("initial_stock").optional().isInt({ min: 0 }),
];

const updateProductValidator = [
  ...productIdValidator,
  body("name").optional().trim().isLength({ min: 2, max: 255 }),
  body("slug").optional().trim().isLength({ min: 2, max: 255 }),
  body("description").optional({ nullable: true }).isString(),
  body("short_description").optional({ nullable: true }).isLength({ max: 500 }),
  body("category_id").optional().isInt({ min: 1 }),
  body("brand_id").optional({ nullable: true }).isInt({ min: 1 }),
  body("seller_id").optional({ nullable: true }).isUUID(),
  body("base_price").optional().isFloat({ min: 0 }),
  body("selling_price").optional().isFloat({ min: 0 }),
  body("discount_percent").optional().isFloat({ min: 0, max: 100 }),
  body("tax_percent").optional().isFloat({ min: 0, max: 100 }),
  body("status").optional().isIn(["active", "draft", "archived"]),
  body("is_featured").optional().isBoolean(),
  body("tags").optional().isArray(),
  body("meta_title").optional({ nullable: true }).isLength({ max: 255 }),
  body("meta_description").optional({ nullable: true }).isString(),
];

module.exports = {
  productIdValidator,
  productListValidator,
  createProductValidator,
  updateProductValidator,
};
