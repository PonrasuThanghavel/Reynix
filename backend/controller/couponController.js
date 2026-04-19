const { Coupon } = require("../model");
const { Op } = require("sequelize");
const { apiResponse } = require("../utils/helpers");

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({
      where: { is_active: true, valid_from: { [Op.lte]: new Date() },
        [Op.or]: [{ valid_until: null }, { valid_until: { [Op.gte]: new Date() } }],
      },
      order: [["created_at", "DESC"]],
    });
    apiResponse(res, 200, true, "Coupons fetched", { coupons });
  } catch (error) { next(error); }
};

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cart_total } = req.body;
    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (!coupon) return apiResponse(res, 404, false, "Coupon not found");
    if (!coupon.is_active) return apiResponse(res, 400, false, "Coupon is inactive");

    const now = new Date();
    if (now < coupon.valid_from) return apiResponse(res, 400, false, "Coupon not yet valid");
    if (coupon.valid_until && now > coupon.valid_until) return apiResponse(res, 400, false, "Coupon expired");
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return apiResponse(res, 400, false, "Coupon usage limit reached");
    if (cart_total && parseFloat(cart_total) < parseFloat(coupon.min_order_amount)) {
      return apiResponse(res, 400, false, `Minimum order amount is ₹${coupon.min_order_amount}`);
    }

    let discount = coupon.discount_type === "percent"
      ? (parseFloat(cart_total || 0) * parseFloat(coupon.discount_value)) / 100
      : parseFloat(coupon.discount_value);
    if (coupon.max_discount_cap) discount = Math.min(discount, parseFloat(coupon.max_discount_cap));

    apiResponse(res, 200, true, "Coupon is valid", { coupon, calculated_discount: discount });
  } catch (error) { next(error); }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const data = { ...req.body };
    data.code = data.code.toUpperCase();
    const coupon = await Coupon.create(data);
    apiResponse(res, 201, true, "Coupon created", { coupon });
  } catch (error) { next(error); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return apiResponse(res, 404, false, "Coupon not found");
    await coupon.update(req.body);
    apiResponse(res, 200, true, "Coupon updated", { coupon });
  } catch (error) { next(error); }
};

exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return apiResponse(res, 404, false, "Coupon not found");
    await coupon.destroy();
    apiResponse(res, 200, true, "Coupon deleted");
  } catch (error) { next(error); }
};

module.exports = exports;
