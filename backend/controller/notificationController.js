const { Notification } = require("../model");
const { apiResponse } = require("../utils/helpers");

exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
      limit,
      offset: (page - 1) * limit,
    });

    apiResponse(res, 200, true, "Notifications fetched", {
      notifications: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notif) return apiResponse(res, 404, false, "Notification not found");
    await notif.update({ is_read: true });
    apiResponse(res, 200, true, "Marked as read");
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    apiResponse(res, 200, true, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
