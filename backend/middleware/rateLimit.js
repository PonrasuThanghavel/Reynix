const AppError = require("../utils/appError");

const stores = new Map();

const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 60,
  keyGenerator = (req) => req.ip,
  code = "RATE_LIMITED",
  message = "Too many requests, please try again later",
} = {}) => {
  const storeKey = `${windowMs}:${max}:${code}`;
  if (!stores.has(storeKey)) stores.set(storeKey, new Map());
  const store = stores.get(storeKey);

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const current = store.get(key);

    if (!current || current.expiresAt <= now) {
      store.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return next(new AppError(message, 429, code));
    }

    current.count += 1;
    store.set(key, current);
    next();
  };
};

module.exports = { createRateLimiter };
