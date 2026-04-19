const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { Product, ProductImage, ProductVariant, Category, Brand, Inventory, User } = require("../model");
const AppError = require("../utils/appError");
const { slugify } = require("../utils/helpers");

const getProducts = async (query, currentUser) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 20;
  const offset = (page - 1) * limit;

  const where = { deleted_at: null };
  if (!currentUser || ["customer", "shipper"].includes(currentUser.role)) where.status = "active";
  if (query.category_id) where.category_id = query.category_id;
  if (query.brand_id) where.brand_id = query.brand_id;
  if (query.seller_id) where.seller_id = query.seller_id;
  if (query.is_featured !== undefined) where.is_featured = query.is_featured === true || query.is_featured === "true";
  if (query.search) where.name = { [Op.iLike]: `%${query.search}%` };
  if (query.min_price || query.max_price) {
    where.selling_price = {};
    if (query.min_price) where.selling_price[Op.gte] = query.min_price;
    if (query.max_price) where.selling_price[Op.lte] = query.max_price;
  }

  let order = [["created_at", "DESC"]];
  if (query.sort === "price_asc") order = [["selling_price", "ASC"]];
  else if (query.sort === "price_desc") order = [["selling_price", "DESC"]];
  else if (query.sort === "rating") order = [["average_rating", "DESC"]];
  else if (query.sort === "name") order = [["name", "ASC"]];

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [
      { model: Category, as: "category", attributes: ["id", "name", "slug"] },
      { model: Brand, as: "brand", attributes: ["id", "name", "slug"] },
      {
        model: ProductImage,
        as: "images",
        where: { is_primary: true },
        attributes: ["id", "image_url", "alt_text", "sort_order", "is_primary"],
        required: false,
      },
      { model: User, as: "seller", attributes: ["id", "full_name", "email"], required: false },
    ],
    order,
    limit,
    offset,
    distinct: true,
    subQuery: false,
  });

  return {
    products: rows,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

const getProductById = async (identifier, currentUser) => {
  const where = { deleted_at: null };
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(identifier)) where.id = identifier;
  else where.slug = identifier;
  if (!currentUser || ["customer", "shipper"].includes(currentUser.role)) where.status = "active";

  const product = await Product.findOne({
    where,
    include: [
      { model: Category, as: "category" },
      { model: Brand, as: "brand" },
      { model: ProductImage, as: "images", required: false },
      { model: ProductVariant, as: "variants", where: { is_active: true }, required: false },
      { model: Inventory, as: "inventory" },
      { model: User, as: "seller", attributes: ["id", "full_name", "email"], required: false },
    ],
    order: [
      [{ model: ProductImage, as: "images" }, "sort_order", "ASC"],
      [{ model: ProductVariant, as: "variants" }, "created_at", "ASC"],
    ],
  });

  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  return product;
};

const createProduct = async (payload, currentUser) => {
  const transaction = await sequelize.transaction();
  try {
    const data = { ...payload };
    if (!data.slug) data.slug = slugify(data.name);
    if (currentUser.role === "seller") data.seller_id = currentUser.id;
    if (currentUser.role === "admin" && !data.seller_id) {
      throw new AppError("seller_id is required when admin creates a product", 400, "SELLER_ID_REQUIRED");
    }

    const product = await Product.create(data, { transaction });
    await Inventory.create({ product_id: product.id, quantity: data.initial_stock || 0 }, { transaction });

    await transaction.commit();
    return product;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const ensureOwnership = (product, currentUser) => {
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  if (currentUser.role === "admin") return;
  if (currentUser.role === "seller" && product.seller_id === currentUser.id) return;
  throw new AppError("Access denied", 403, "PRODUCT_ACCESS_DENIED");
};

const updateProduct = async (productId, payload, currentUser) => {
  const product = await Product.findByPk(productId);
  ensureOwnership(product, currentUser);

  const data = { ...payload };
  if (data.name && !data.slug) data.slug = slugify(data.name);
  if (currentUser.role === "seller") delete data.seller_id;

  await product.update(data);
  return product;
};

const deleteProduct = async (productId, currentUser) => {
  const product = await Product.findByPk(productId);
  ensureOwnership(product, currentUser);
  await product.update({ deleted_at: new Date(), status: "archived" });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
