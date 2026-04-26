/**
 * Application error with HTTP metadata for consistent API responses.
 */
class AppError extends Error {
  /**
   * Create an application error instance.
   *
   * @param {string} message Human-readable error message.
   * @param {number} [statusCode=500] HTTP status code.
   * @param {string} [code="INTERNAL_SERVER_ERROR"] Stable application error code.
   * @param {unknown} [details=null] Optional structured error details.
   */
  constructor(message, statusCode = 500, code = "INTERNAL_SERVER_ERROR", details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

module.exports = AppError;
