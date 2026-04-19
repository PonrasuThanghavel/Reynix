const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Category = sequelize.define(
  "categories",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    image_url: {
      type: DataTypes.TEXT,
    },
    parent_id: {
      type: DataTypes.BIGINT,
      references: { model: "categories", key: "id" },
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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

// Self-referencing association for subcategories
Category.hasMany(Category, { as: "children", foreignKey: "parent_id" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parent_id" });

module.exports = Category;
