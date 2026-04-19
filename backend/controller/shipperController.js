const shipmentService = require("../services/shipmentService");
const { apiResponse } = require("../utils/helpers");

exports.getShipments = async (req, res, next) => {
  try {
    const shipments = await shipmentService.getAssignedShipments(req.user.id);
    apiResponse(res, 200, true, "Assigned shipments fetched", { shipments });
  } catch (error) {
    next(error);
  }
};

exports.getShipmentById = async (req, res, next) => {
  try {
    const shipment = await shipmentService.getShipmentForShipper(req.user.id, req.params.id);
    apiResponse(res, 200, true, "Shipment fetched", { shipment });
  } catch (error) {
    next(error);
  }
};

exports.updateShipmentStatus = async (req, res, next) => {
  try {
    const shipment = await shipmentService.updateShipmentStatus(req.user.id, req.params.id, req.body);
    apiResponse(res, 200, true, "Shipment status updated", { shipment });
  } catch (error) {
    next(error);
  }
};

exports.confirmShipment = async (req, res, next) => {
  try {
    const shipment = await shipmentService.confirmShipmentDelivery(req.user.id, req.params.id, req.body.otp);
    apiResponse(res, 200, true, "Shipment delivery confirmed", { shipment });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
