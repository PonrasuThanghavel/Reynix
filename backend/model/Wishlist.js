const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Wishlist = sequelize.define(
  "wishlist",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: "users", key: "id" } },
    product_id: { type: DataTypes.UUID, allowNull: false, references: { model: "products", key: "id" } },
    variant_id: { type: DataTypes.BIGINT, references: { model: "product_variants", key: "id" } },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["user_id", "product_id", "variant_id"], name: "wishlist_unique_entry" }],
  }
);

module.exports = Wishlist;
