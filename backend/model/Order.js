const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Order = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"]],
      },
    },
    shipping_address_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: "user_addresses", key: "id" },
    },
    billing_address_id: {
      type: DataTypes.BIGINT,
      references: { model: "user_addresses", key: "id" },
    },
    coupon_id: {
      type: DataTypes.BIGINT,
      references: { model: "coupons", key: "id" },
    },
    subtotal: {
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
    shipping_charge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    cancelled_at: {
      type: DataTypes.DATE,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [{ fields: ["user_id"] }, { fields: ["status"] }, { fields: ["created_at"] }],
  }
);

module.exports = Order;
