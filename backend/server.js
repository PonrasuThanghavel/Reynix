const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB, sequelize } = require("./config/database");
const errorHandler = require("./utils/errorHandler");
const logger = require("./utils/logger");
const { createRateLimiter } = require("./middleware/rateLimit");

// Import all models (registers associations)
require("./model");

// Import routes
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const shipperRoutes = require("./routes/shipperRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const couponRoutes = require("./routes/couponRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(createRateLimiter({ windowMs: 60 * 1000, max: 300, code: "API_RATE_LIMITED" }));

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Reynix E-Commerce API is running 🚀", timestamp: new Date().toISOString() });
});

// ── API Routes ──
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/shipper", shipperRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──
app.use(errorHandler);

// ── Start server ──
const startServer = async () => {
  await connectDB();

  // Sync database (alter in dev, do nothing in prod)
  if (process.env.NODE_ENV === "development") {
    await sequelize.sync({ alter: true });
    logger.info("Database tables synced", { mode: "alter" });
  }

  app.listen(PORT, () => {
    logger.info("Server running", { port: PORT, url: `http://localhost:${PORT}` });
    logger.info("Health check ready", { url: `http://localhost:${PORT}/api/health` });
  });
};

startServer();
