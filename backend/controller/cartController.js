const { Cart, CartItem, Product, ProductVariant } = require("../model");
const { apiResponse } = require("../utils/helpers");

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { user_id: req.user.id, status: "active" },
      include: [{ model: CartItem, as: "items", include: [
        { model: Product, as: "product", attributes: ["id", "name", "slug", "selling_price"] },
        { model: ProductVariant, as: "variant", attributes: ["id", "variant_name", "selling_price"] },
      ]}],
    });
    if (!cart) { cart = await Cart.create({ user_id: req.user.id }); cart.dataValues.items = []; }
    apiResponse(res, 200, true, "Cart fetched", { cart });
  } catch (error) { next(error); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { product_id, variant_id, quantity } = req.body;
    let cart = await Cart.findOne({ where: { user_id: req.user.id, status: "active" } });
    if (!cart) cart = await Cart.create({ user_id: req.user.id });

    const product = await Product.findByPk(product_id);
    if (!product) return apiResponse(res, 404, false, "Product not found");

    let unit_price = parseFloat(product.selling_price);
    if (variant_id) {
      const variant = await ProductVariant.findByPk(variant_id);
      if (variant) unit_price = parseFloat(variant.selling_price);
    }

    const existing = await CartItem.findOne({ where: { cart_id: cart.id, product_id, variant_id: variant_id || null } });
    if (existing) {
      await existing.update({ quantity: existing.quantity + (quantity || 1), unit_price });
      return apiResponse(res, 200, true, "Cart item updated", { item: existing });
    }

    const item = await CartItem.create({ cart_id: cart.id, product_id, variant_id, quantity: quantity || 1, unit_price });
    apiResponse(res, 201, true, "Item added to cart", { item });
  } catch (error) { next(error); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.itemId);
    if (!item) return apiResponse(res, 404, false, "Cart item not found");
    if (req.body.quantity <= 0) { await item.destroy(); return apiResponse(res, 200, true, "Item removed"); }
    await item.update({ quantity: req.body.quantity });
    apiResponse(res, 200, true, "Cart item updated", { item });
  } catch (error) { next(error); }
};

exports.removeItem = async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.itemId);
    if (!item) return apiResponse(res, 404, false, "Cart item not found");
    await item.destroy();
    apiResponse(res, 200, true, "Item removed from cart");
  } catch (error) { next(error); }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.id, status: "active" } });
    if (!cart) return apiResponse(res, 404, false, "No active cart");
    await CartItem.destroy({ where: { cart_id: cart.id } });
    apiResponse(res, 200, true, "Cart cleared");
  } catch (error) { next(error); }
};

module.exports = exports;
