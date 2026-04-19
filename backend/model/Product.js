const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define(
  "products",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    short_description: {
      type: DataTypes.STRING(500),
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "categories", key: "id" },
    },
    brand_id: {
      type: DataTypes.BIGINT,
      references: { model: "brands", key: "id" },
    },
    seller_id: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    base_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    selling_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    discount_percent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    tax_percent: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    sku: {
      type: DataTypes.STRING(100),
      unique: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
      validate: { isIn: [["active", "draft", "archived"]] },
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    meta_title: {
      type: DataTypes.STRING(255),
    },
    meta_description: {
      type: DataTypes.TEXT,
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["category_id"] },
      { fields: ["brand_id"] },
      { fields: ["seller_id"] },
      { fields: ["status"] },
      { fields: ["slug"] },
      { fields: ["seller_id", "status"] },
    ],
  }
);

module.exports = Product;
