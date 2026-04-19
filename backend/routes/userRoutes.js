const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { authenticate, authorize } = require("../utils/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createRateLimiter } = require("../middleware/rateLimit");
const { registerValidator, loginValidator, updateProfileValidator } = require("../validation/userValidators");

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => `${req.ip}:${req.body.email || "anonymous"}`,
  code: "AUTH_RATE_LIMITED",
  message: "Too many authentication attempts, please try again later",
});

router.post("/register", authLimiter, registerValidator, validateRequest(["body"]), userController.register);
router.post("/login", authLimiter, loginValidator, validateRequest(["body"]), userController.login);
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, updateProfileValidator, validateRequest(["body"]), userController.updateProfile);
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);

module.exports = router;
