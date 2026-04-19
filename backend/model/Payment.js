const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payment = sequelize.define(
  "payments",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "orders", key: "id" },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [["upi", "card", "netbanking", "wallet", "cod"]] },
    },
    provider: { type: DataTypes.STRING(50) },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      validate: { isIn: [["pending", "success", "failed", "refunded"]] },
    },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    currency: { type: DataTypes.STRING(10), defaultValue: "INR" },
    gateway_transaction_id: { type: DataTypes.STRING(255) },
    gateway_response: { type: DataTypes.JSONB },
    paid_at: { type: DataTypes.DATE },
    refunded_at: { type: DataTypes.DATE },
    refund_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  },
  { timestamps: true, createdAt: "created_at", updatedAt: "updated_at" }
);

module.exports = Payment;
