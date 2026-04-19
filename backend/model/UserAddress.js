const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const UserAddress = sequelize.define(
  "user_addresses",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    label: {
      type: DataTypes.STRING(50),
    },
    full_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address_line1: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "India",
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = UserAddress;
