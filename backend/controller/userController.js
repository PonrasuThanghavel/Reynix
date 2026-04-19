const userService = require("../services/userService");
const { apiResponse } = require("../utils/helpers");

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const data = await userService.register(req.body);
    apiResponse(res, 201, true, "Registration successful", data);
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const data = await userService.login(req.body);
    apiResponse(res, 200, true, "Login successful", data);
  } catch (error) {
    next(error);
  }
};

// Get current user profile
exports.getProfile = async (req, res, next) => {
  try {
    apiResponse(res, 200, true, "Profile fetched", { user: req.user });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user, req.body);
    apiResponse(res, 200, true, "Profile updated", { user });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const data = await userService.getAllUsers(req.query);
    apiResponse(res, 200, true, "Users fetched", data);
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
