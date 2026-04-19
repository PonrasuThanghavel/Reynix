const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ProductImage = sequelize.define(
  "product_images",
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
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    alt_text: {
      type: DataTypes.STRING(255),
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = ProductImage;
