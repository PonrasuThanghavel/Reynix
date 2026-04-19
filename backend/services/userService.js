const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../model");
const AppError = require("../utils/appError");

const sanitizeUser = (user) => {
  const userData = user.toJSON ? user.toJSON() : { ...user };
  delete userData.password_hash;
  return userData;
};

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async ({ full_name, email, phone_number, password, role }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new AppError("Email already registered", 409, "EMAIL_ALREADY_EXISTS");

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    full_name,
    email,
    phone_number,
    password_hash,
    role: role || "customer",
  });

  return { user: sanitizeUser(user), token: signToken(user) };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  if (!user.is_active) throw new AppError("Account is deactivated", 403, "ACCOUNT_DEACTIVATED");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

  await user.update({ last_login_at: new Date() });
  return { user: sanitizeUser(user), token: signToken(user) };
};

const updateProfile = async (user, payload) => {
  const allowedFields = ["full_name", "phone_number", "avatar_url", "date_of_birth", "gender"];
  const updateData = {};

  for (const field of allowedFields) {
    if (payload[field] !== undefined) updateData[field] = payload[field];
  }

  await user.update(updateData);
  return sanitizeUser(user);
};

const getAllUsers = async ({ page = 1, limit = 20 }) => {
  const numericPage = Number.parseInt(page, 10) || 1;
  const numericLimit = Number.parseInt(limit, 10) || 20;
  const offset = (numericPage - 1) * numericLimit;

  const { count, rows } = await User.findAndCountAll({
    attributes: { exclude: ["password_hash"] },
    where: { deleted_at: null },
    order: [["created_at", "DESC"]],
    limit: numericLimit,
    offset,
  });

  return {
    users: rows.map(sanitizeUser),
    pagination: { total: count, page: numericPage, limit: numericLimit, totalPages: Math.ceil(count / numericLimit) },
  };
};

module.exports = {
  register,
  login,
  updateProfile,
  getAllUsers,
  sanitizeUser,
};
