const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Shipment = sequelize.define(
  "shipments",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false, references: { model: "orders", key: "id" } },
    seller_order_id: { type: DataTypes.BIGINT, references: { model: "seller_orders", key: "id" } },
    shipper_id: { type: DataTypes.UUID, references: { model: "users", key: "id" } },
    tracking_number: { type: DataTypes.STRING(100) },
    carrier: { type: DataTypes.STRING(100) },
    status: {
      type: DataTypes.STRING(30),
      defaultValue: "pending",
      validate: { isIn: [["pending", "dispatched", "in_transit", "out_for_delivery", "delivered", "failed"]] },
    },
    assigned_at: { type: DataTypes.DATE },
    estimated_delivery_date: { type: DataTypes.DATEONLY },
    delivery_otp: { type: DataTypes.TEXT },
    delivery_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
    delivered_at: { type: DataTypes.DATE },
    shipping_label_url: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["order_id"] },
      { fields: ["seller_order_id"] },
      { fields: ["shipper_id"] },
      { fields: ["shipper_id", "status"] },
    ],
  }
);

module.exports = Shipment;
