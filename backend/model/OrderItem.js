const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const OrderItem = sequelize.define(
  "order_items",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "orders", key: "id" },
    },
    seller_order_id: {
      type: DataTypes.BIGINT,
      references: { model: "seller_orders", key: "id" },
    },
    seller_id: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
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
    product_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    variant_name: {
      type: DataTypes.STRING(100),
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    total_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    return_status: {
      type: DataTypes.STRING(20),
      validate: { isIn: [["requested", "approved", "completed"]] },
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ fields: ["order_id"] }, { fields: ["seller_order_id"] }, { fields: ["seller_id"] }],
  }
);

module.exports = OrderItem;
