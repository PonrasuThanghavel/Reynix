const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");
const { authenticate } = require("../utils/authMiddleware");

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);

module.exports = router;
