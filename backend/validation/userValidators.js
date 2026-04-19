const { body } = require("express-validator");

const allowedRoles = ["customer", "admin", "seller", "shipper"];

const registerValidator = [
  body("full_name").trim().isLength({ min: 2, max: 150 }),
  body("email").trim().isEmail().normalizeEmail(),
  body("phone_number").optional({ nullable: true }).trim().isLength({ min: 7, max: 20 }),
  body("password").isLength({ min: 8, max: 128 }),
  body("role").optional().isIn(allowedRoles),
];

const loginValidator = [
  body("email").trim().isEmail().normalizeEmail(),
  body("password").isLength({ min: 8, max: 128 }),
];

const updateProfileValidator = [
  body("full_name").optional().trim().isLength({ min: 2, max: 150 }),
  body("phone_number").optional({ nullable: true }).trim().isLength({ min: 7, max: 20 }),
  body("avatar_url").optional({ nullable: true }).isURL(),
  body("date_of_birth").optional({ nullable: true }).isISO8601(),
  body("gender").optional({ nullable: true }).isIn(["male", "female", "other"]),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
};
