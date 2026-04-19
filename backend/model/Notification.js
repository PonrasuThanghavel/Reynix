const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
  "notifications",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [["order_update", "promo", "review_reply", "restock", "shipment_update"]] },
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    reference_id: { type: DataTypes.UUID },
    reference_type: { type: DataTypes.STRING(50) },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true, createdAt: "created_at", updatedAt: false }
);

module.exports = Notification;
