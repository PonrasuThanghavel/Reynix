const formatLog = (level, message, meta = {}) =>
  JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  });

const logger = {
  info(message, meta) {
    console.log(formatLog("info", message, meta));
  },
  warn(message, meta) {
    console.warn(formatLog("warn", message, meta));
  },
  error(message, meta) {
    console.error(formatLog("error", message, meta));
  },
};

module.exports = logger;
