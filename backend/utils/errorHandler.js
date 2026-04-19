const AppError = require("./appError");
const logger = require("./logger");

/**
 * Global error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  logger.error(err.message || "Unhandled error", {
    code: err.code,
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ success: false, code: "VALIDATION_ERROR", message: "Validation error", errors });
  }

  // Sequelize FK constraint errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res
      .status(400)
      .json({ success: false, code: "FOREIGN_KEY_CONSTRAINT", message: "Referenced record not found" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, code: "INVALID_TOKEN", message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, code: "TOKEN_EXPIRED", message: "Token expired" });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      errors: err.details || undefined,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
