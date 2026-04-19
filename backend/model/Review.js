const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define(
  "reviews",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.UUID, allowNull: false, references: { model: "products", key: "id" } },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
    order_item_id: { type: DataTypes.BIGINT, references: { model: "order_items", key: "id" } },
    rating: { type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1, max: 5 } },
    title: { type: DataTypes.STRING(255) },
    body: { type: DataTypes.TEXT },
    image_urls: { type: DataTypes.ARRAY(DataTypes.TEXT) },
    is_verified_purchase: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_approved: { type: DataTypes.BOOLEAN, defaultValue: true },
    helpful_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["product_id"] }],
  }
);

module.exports = Review;
