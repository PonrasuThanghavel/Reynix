const { Inventory } = require("../model");
const { apiResponse } = require("../utils/helpers");

exports.getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findAll({
      where: { product_id: req.params.productId },
    });
    apiResponse(res, 200, true, "Inventory fetched", { inventory });
  } catch (error) {
    next(error);
  }
};

exports.updateInventory = async (req, res, next) => {
  try {
    const record = await Inventory.findByPk(req.params.id);
    if (!record) return apiResponse(res, 404, false, "Inventory record not found");
    await record.update(req.body);
    apiResponse(res, 200, true, "Inventory updated", { inventory: record });
  } catch (error) {
    next(error);
  }
};

exports.getLowStock = async (req, res, next) => {
  try {
    const { literal } = require("sequelize");
    const items = await Inventory.findAll({
      where: literal("quantity <= low_stock_threshold"),
    });
    apiResponse(res, 200, true, "Low stock items", { items });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
