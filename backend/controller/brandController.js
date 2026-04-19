const { Brand } = require("../model");
const { apiResponse, slugify } = require("../utils/helpers");

exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
    });
    apiResponse(res, 200, true, "Brands fetched", { brands });
  } catch (error) {
    next(error);
  }
};

exports.getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return apiResponse(res, 404, false, "Brand not found");
    apiResponse(res, 200, true, "Brand fetched", { brand });
  } catch (error) {
    next(error);
  }
};

exports.createBrand = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.slug) data.slug = slugify(data.name);
    const brand = await Brand.create(data);
    apiResponse(res, 201, true, "Brand created", { brand });
  } catch (error) {
    next(error);
  }
};

exports.updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return apiResponse(res, 404, false, "Brand not found");
    if (req.body.name && !req.body.slug) req.body.slug = slugify(req.body.name);
    await brand.update(req.body);
    apiResponse(res, 200, true, "Brand updated", { brand });
  } catch (error) {
    next(error);
  }
};

exports.deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return apiResponse(res, 404, false, "Brand not found");
    await brand.destroy();
    apiResponse(res, 200, true, "Brand deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
