const User = require("./User");
const UserAddress = require("./UserAddress");
const Category = require("./Category");
const Brand = require("./Brand");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const ProductVariant = require("./ProductVariant");
const Inventory = require("./Inventory");
const Coupon = require("./Coupon");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const SellerOrder = require("./SellerOrder");
const Payment = require("./Payment");
const Shipment = require("./Shipment");
const Review = require("./Review");
const Wishlist = require("./Wishlist");
const Notification = require("./Notification");

// ── User associations ──
User.hasMany(UserAddress, { foreignKey: "user_id", as: "addresses" });
UserAddress.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Wishlist, { foreignKey: "user_id", as: "wishlistItems" });
Wishlist.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Cart, { foreignKey: "user_id", as: "carts" });
Cart.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Payment, { foreignKey: "user_id", as: "payments" });
Payment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Product, { foreignKey: "seller_id", as: "sellerProducts" });
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
User.hasMany(SellerOrder, { foreignKey: "seller_id", as: "sellerOrders" });
SellerOrder.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
User.hasMany(Shipment, { foreignKey: "shipper_id", as: "assignedShipments" });
Shipment.belongsTo(User, { foreignKey: "shipper_id", as: "shipper" });

// ── Category → Product ──
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// ── Brand → Product ──
Brand.hasMany(Product, { foreignKey: "brand_id", as: "products" });
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

// ── Product children ──
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(ProductVariant, { foreignKey: "product_id", as: "variants" });
ProductVariant.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(Inventory, { foreignKey: "product_id", as: "inventory" });
Inventory.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(Review, { foreignKey: "product_id", as: "reviews" });
Review.belongsTo(Product, { foreignKey: "product_id" });

Product.hasMany(Wishlist, { foreignKey: "product_id", as: "wishlistEntries" });
Wishlist.belongsTo(Product, { foreignKey: "product_id" });

// ── Variant → Inventory ──
ProductVariant.hasOne(Inventory, { foreignKey: "variant_id", as: "inventory" });
Inventory.belongsTo(ProductVariant, { foreignKey: "variant_id" });

// ── Cart ──
Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

Cart.belongsTo(Coupon, { foreignKey: "coupon_id", as: "coupon" });

CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
CartItem.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });

// ── Order ──
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(SellerOrder, { foreignKey: "order_id", as: "sellerOrders" });
SellerOrder.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Order.hasMany(Payment, { foreignKey: "order_id", as: "payments" });
Payment.belongsTo(Order, { foreignKey: "order_id" });

Order.hasOne(Shipment, { foreignKey: "order_id", as: "shipment" });
Shipment.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(Shipment, { foreignKey: "order_id", as: "shipments" });
SellerOrder.hasMany(OrderItem, { foreignKey: "seller_order_id", as: "items" });
OrderItem.belongsTo(SellerOrder, { foreignKey: "seller_order_id", as: "sellerOrder" });
SellerOrder.hasOne(Shipment, { foreignKey: "seller_order_id", as: "shipment" });
Shipment.belongsTo(SellerOrder, { foreignKey: "seller_order_id", as: "sellerOrder" });

Order.belongsTo(Coupon, { foreignKey: "coupon_id", as: "coupon" });
Order.belongsTo(UserAddress, { foreignKey: "shipping_address_id", as: "shippingAddress" });
Order.belongsTo(UserAddress, { foreignKey: "billing_address_id", as: "billingAddress" });

OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
OrderItem.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });

// ── Review → OrderItem (verified purchase) ──
Review.belongsTo(OrderItem, { foreignKey: "order_item_id", as: "orderItem" });
OrderItem.hasOne(Review, { foreignKey: "order_item_id", as: "review" });

// ── Wishlist → Variant ──
Wishlist.belongsTo(ProductVariant, { foreignKey: "variant_id", as: "variant" });

module.exports = {
  User,
  UserAddress,
  Category,
  Brand,
  Product,
  ProductImage,
  ProductVariant,
  Inventory,
  Coupon,
  Cart,
  CartItem,
  Order,
  OrderItem,
  SellerOrder,
  Payment,
  Shipment,
  Review,
  Wishlist,
  Notification,
};
