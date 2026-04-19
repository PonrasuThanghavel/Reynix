const { Payment, Order } = require("../model");
const { apiResponse } = require("../utils/helpers");

exports.createPayment = async (req, res, next) => {
  try {
    const { order_id, method, provider, amount } = req.body;
    const order = await Order.findOne({ where: { id: order_id, user_id: req.user.id } });
    if (!order) return apiResponse(res, 404, false, "Order not found");

    const payment = await Payment.create({
      order_id, user_id: req.user.id, method, provider,
      amount: amount || order.total_amount, currency: "INR",
    });
    apiResponse(res, 201, true, "Payment initiated", { payment });
  } catch (error) { next(error); }
};

exports.getPaymentsByOrder = async (req, res, next) => {
  try {
    const payments = await Payment.findAll({ where: { order_id: req.params.orderId }, order: [["created_at", "DESC"]] });
    apiResponse(res, 200, true, "Payments fetched", { payments });
  } catch (error) { next(error); }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return apiResponse(res, 404, false, "Payment not found");

    const updateData = { status: req.body.status };
    if (req.body.status === "success") {
      updateData.paid_at = new Date();
      updateData.gateway_transaction_id = req.body.gateway_transaction_id;
      updateData.gateway_response = req.body.gateway_response;
      await Order.update({ status: "confirmed" }, { where: { id: payment.order_id } });
    }
    if (req.body.status === "refunded") {
      updateData.refunded_at = new Date();
      updateData.refund_amount = req.body.refund_amount || payment.amount;
    }

    await payment.update(updateData);
    apiResponse(res, 200, true, "Payment updated", { payment });
  } catch (error) { next(error); }
};

module.exports = exports;
