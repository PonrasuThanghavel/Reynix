const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Coupon = sequelize.define(
  "coupons",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    discount_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [["percent", "flat"]] },
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    min_order_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    max_discount_cap: {
      type: DataTypes.DECIMAL(12, 2),
    },
    usage_limit: {
      type: DataTypes.INTEGER,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    per_user_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    valid_from: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    valid_until: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Coupon;
