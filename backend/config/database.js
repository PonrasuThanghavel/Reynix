const { Sequelize } = require("sequelize");
require("dotenv").config();
const logger = require("../utils/logger");

const sequelize = new Sequelize(
  process.env.DB_NAME || "ecommerce_db",
  process.env.DB_USER || "ecom_user",
  process.env.DB_PASSWORD || "yourpassword",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? (message) => logger.info(message, { source: "sequelize" }) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      paranoid: false,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info("PostgreSQL connected successfully");
  } catch (error) {
    logger.error("Unable to connect to PostgreSQL", { error: error.message });
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
