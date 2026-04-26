const { sequelize } = require("./config/database");
require("./model");

/**
 * Re-sync all Sequelize tables against the configured database.
 *
 * @returns {Promise<void>} Resolves when synchronization completes.
 */
async function recreate() {
  try {
    await sequelize.authenticate();
    console.log("Re-syncing database...");
    await sequelize.sync({ alter: true });
    console.log("Database tables recreated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error recreating tables:", error);
    process.exit(1);
  }
}

recreate();
