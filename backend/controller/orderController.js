const orderService = require("../services/orderService");
const { apiResponse } = require("../utils/helpers");

exports.createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user, req.body);
    apiResponse(res, 201, true, "Order placed", { order });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const data = await orderService.getOrders(req.user, req.query);
    apiResponse(res, 200, true, "Orders fetched", data);
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.user, req.params.id);
    apiResponse(res, 200, true, "Order fetched", { order });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.user, req.params.id, req.body.reason);
    apiResponse(res, 200, true, "Order cancelled", { order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    apiResponse(res, 200, true, "Order status updated", { order });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
