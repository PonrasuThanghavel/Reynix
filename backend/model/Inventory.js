const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Inventory = sequelize.define(
  "inventory",
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
    variant_id: {
      type: DataTypes.BIGINT,
      references: { model: "product_variants", key: "id" },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reserved_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    warehouse_location: {
      type: DataTypes.STRING(100),
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
  },
  {
    timestamps: true,
    createdAt: false,
    updatedAt: "updated_at",
    indexes: [{ fields: ["product_id"] }],
  }
);

module.exports = Inventory;
