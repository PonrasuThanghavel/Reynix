/**
 * Generates a unique order number with prefix and timestamp.
 * Format: ORD-<timestamp>-<random>
 *
 * @returns {string} Generated order number.
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Creates a URL-friendly slug from a string.
 *
 * @param {string} text Source text.
 * @returns {string} Slugified text.
 */
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Standard API response wrapper.
 *
 * @param {import("express").Response} res Express response.
 * @param {number} statusCode HTTP status code.
 * @param {boolean} success Whether the request succeeded.
 * @param {string} message Response message.
 * @param {unknown} [data=null] Optional response payload.
 * @param {unknown} [meta=null] Optional metadata payload.
 * @returns {import("express").Response} JSON response.
 */
const apiResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

module.exports = { generateOrderNumber, slugify, apiResponse };
