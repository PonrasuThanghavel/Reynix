const { validationResult, matchedData } = require("express-validator");
const AppError = require("../utils/appError");

const validateRequest = (locations = ["body", "params", "query"]) => (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", errors.array()));
  }

  for (const location of locations) {
    const sanitized = matchedData(req, { locations: [location], includeOptionals: true });
    if (Object.keys(sanitized).length) {
      req[location] = { ...req[location], ...sanitized };
    }
  }

  next();
};

module.exports = validateRequest;
