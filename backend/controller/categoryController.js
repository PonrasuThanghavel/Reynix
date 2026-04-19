const { Category } = require("../model");
const { apiResponse, slugify } = require("../utils/helpers");

// Get all categories (with nested children)
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { parent_id: null, is_active: true },
      include: [{ model: Category, as: "children", where: { is_active: true }, required: false }],
      order: [
        ["sort_order", "ASC"],
        ["name", "ASC"],
      ],
    });
    apiResponse(res, 200, true, "Categories fetched", { categories });
  } catch (error) {
    next(error);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: "children" },
        { model: Category, as: "parent" },
      ],
    });
    if (!category) return apiResponse(res, 404, false, "Category not found");
    apiResponse(res, 200, true, "Category fetched", { category });
  } catch (error) {
    next(error);
  }
};

// Create category (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.slug) data.slug = slugify(data.name);
    const category = await Category.create(data);
    apiResponse(res, 201, true, "Category created", { category });
  } catch (error) {
    next(error);
  }
};

// Update category (admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return apiResponse(res, 404, false, "Category not found");
    if (req.body.name && !req.body.slug) req.body.slug = slugify(req.body.name);
    await category.update(req.body);
    apiResponse(res, 200, true, "Category updated", { category });
  } catch (error) {
    next(error);
  }
};

// Delete category (admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return apiResponse(res, 404, false, "Category not found");
    await category.destroy();
    apiResponse(res, 200, true, "Category deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
