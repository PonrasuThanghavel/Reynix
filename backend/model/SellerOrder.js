const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SellerOrder = sequelize.define(
  "seller_orders",
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
    seller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    status: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      validate: { isIn: [["pending", "packed", "assigned", "shipped", "delivered", "cancelled"]] },
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["order_id"] },
      { fields: ["seller_id"] },
      { fields: ["status"] },
      { fields: ["seller_id", "status"] },
    ],
  }
);

module.exports = SellerOrder;
