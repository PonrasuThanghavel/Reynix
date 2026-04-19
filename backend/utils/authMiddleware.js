const jwt = require("jsonwebtoken");
const { User } = require("../model");
const AppError = require("./appError");

/**
 * Middleware to verify JWT and attach user to req.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user || !user.is_active) {
      return next(new AppError("User not found or deactivated", 401, "USER_NOT_AVAILABLE"));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
    }
    next(error);
  }
};

/**
 * Middleware to restrict access by role.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403, "ACCESS_DENIED"));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
