const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductVariant = sequelize.define(
  "product_variants",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "products", key: "id" },
    },
    variant_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    attributes: {
      type: DataTypes.JSONB,
    },
    price_modifier: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    selling_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ProductVariant;
