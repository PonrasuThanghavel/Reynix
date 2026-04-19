const { Wishlist, Product, ProductVariant } = require("../model");
const { apiResponse } = require("../utils/helpers");

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Product, as: "product", attributes: ["id", "name", "slug", "selling_price", "base_price"] },
        { model: ProductVariant, as: "variant", attributes: ["id", "variant_name", "selling_price"] },
      ],
      order: [["created_at", "DESC"]],
    });
    apiResponse(res, 200, true, "Wishlist fetched", { items });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const { product_id, variant_id } = req.body;
    const [item, created] = await Wishlist.findOrCreate({
      where: { user_id: req.user.id, product_id, variant_id: variant_id || null },
      defaults: { user_id: req.user.id, product_id, variant_id },
    });
    apiResponse(res, created ? 201 : 200, true, created ? "Added to wishlist" : "Already in wishlist", { item });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return apiResponse(res, 404, false, "Wishlist item not found");
    await item.destroy();
    apiResponse(res, 200, true, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
