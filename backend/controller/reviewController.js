const { Review, Product, OrderItem } = require("../model");
const { sequelize } = require("../config/database");
const { apiResponse } = require("../utils/helpers");

exports.getProductReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { count, rows } = await Review.findAndCountAll({
      where: { product_id: req.params.productId, is_approved: true },
      order: [["created_at", "DESC"]], limit, offset: (page - 1) * limit,
    });

    apiResponse(res, 200, true, "Reviews fetched", {
      reviews: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) { next(error); }
};

exports.createReview = async (req, res, next) => {
  try {
    const { product_id, order_item_id, rating, title, body, image_urls } = req.body;
    let is_verified_purchase = false;

    if (order_item_id) {
      const orderItem = await OrderItem.findByPk(order_item_id);
      if (orderItem && orderItem.product_id === product_id) is_verified_purchase = true;
    }

    const review = await Review.create({
      product_id, user_id: req.user.id, order_item_id,
      rating, title, body, image_urls, is_verified_purchase,
    });

    // Update product's cached rating
    const stats = await Review.findOne({
      where: { product_id, is_approved: true },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      raw: true,
    });

    await Product.update(
      { average_rating: parseFloat(stats.avg_rating) || 0, review_count: parseInt(stats.count) || 0 },
      { where: { id: product_id } }
    );

    apiResponse(res, 201, true, "Review submitted", { review });
  } catch (error) { next(error); }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!review) return apiResponse(res, 404, false, "Review not found");
    const productId = review.product_id;
    await review.destroy();

    // Recalculate cached rating
    const stats = await Review.findOne({
      where: { product_id: productId, is_approved: true },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      raw: true,
    });
    await Product.update(
      { average_rating: parseFloat(stats.avg_rating) || 0, review_count: parseInt(stats.count) || 0 },
      { where: { id: productId } }
    );

    apiResponse(res, 200, true, "Review deleted");
  } catch (error) { next(error); }
};

module.exports = exports;
