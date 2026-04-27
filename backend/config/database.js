const { Sequelize } = require("sequelize");
const { Client } = require("pg");
require("dotenv").config();
const logger = require("../utils/logger");

const dbConfig = {
  database: process.env.DB_NAME || "ecommerce_db",
  user: process.env.DB_USER || "ecom_user",
  password: process.env.DB_PASSWORD || "yourpassword",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
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
});

const quoteIdentifier = (value) => `"${String(value).replace(/"/g, '""')}"`;

const createMaintenanceClient = (database) =>
  new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database,
  });

const ensureDatabaseExists = async () => {
  const maintenanceDatabases = ["postgres", "template1"];
  let lastError = null;

  for (const maintenanceDb of maintenanceDatabases) {
    const client = createMaintenanceClient(maintenanceDb);

    try {
      await client.connect();
      const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbConfig.database]);

      if (result.rowCount === 0) {
        await client.query(`CREATE DATABASE ${quoteIdentifier(dbConfig.database)}`);
        logger.info("PostgreSQL database created", { database: dbConfig.database, maintenanceDb });
      }

      await client.end();
      return;
    } catch (error) {
      lastError = error;
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors and try the next maintenance database.
      }
    }
  }

  throw lastError;
};

const connectDB = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    logger.info("PostgreSQL connected successfully");
  } catch (error) {
    logger.error("Unable to connect to PostgreSQL", { error: error.message });
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
