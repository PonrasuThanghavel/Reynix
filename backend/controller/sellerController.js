const sellerService = require("../services/sellerService");
const { apiResponse } = require("../utils/helpers");

exports.getSellerOrders = async (req, res, next) => {
  try {
    const data = await sellerService.getSellerOrders(req.user.id, req.query);
    apiResponse(res, 200, true, "Seller orders fetched", data);
  } catch (error) {
    next(error);
  }
};

exports.packOrder = async (req, res, next) => {
  try {
    const sellerOrder = await sellerService.packSellerOrder(req.user.id, req.params.id);
    apiResponse(res, 200, true, "Seller order packed", { sellerOrder });
  } catch (error) {
    next(error);
  }
};

exports.assignShipper = async (req, res, next) => {
  try {
    const result = await sellerService.assignShipper(req.user.id, req.params.id, req.body);
    apiResponse(res, 200, true, "Shipper assigned", result);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
