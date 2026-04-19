const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Cart = sequelize.define(
  "carts",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      references: { model: "users", key: "id" },
    },
    session_id: {
      type: DataTypes.STRING(255),
    },
    coupon_id: {
      type: DataTypes.BIGINT,
      references: { model: "coupons", key: "id" },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active",
      validate: { isIn: [["active", "merged", "abandoned"]] },
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Cart;
