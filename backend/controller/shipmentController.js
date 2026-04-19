const shipmentService = require("../services/shipmentService");
const { apiResponse } = require("../utils/helpers");

exports.getShipmentByOrder = async (req, res, next) => {
  try {
    const data = await shipmentService.getShipmentByOrder(req.params.orderId, req.user);
    apiResponse(res, 200, true, "Shipment fetched", data);
  } catch (error) { next(error); }
};

exports.updateShipment = async (req, res, next) => {
  try {
    const shipment = await shipmentService.adminUpdateShipment(req.params.id, req.body);
    apiResponse(res, 200, true, "Shipment updated", { shipment });
  } catch (error) { next(error); }
};

module.exports = exports;
