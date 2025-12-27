// server/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  createNotification,
  getSettings,
  saveSettings,
  markAsRead,
} = require("../controllers/notificationController");
const Notification = require("../models/Notification");
const authMiddleware = require("../middlewares/authMiddleware");

// Get all notifications and settings for user
router.get("/", authMiddleware, getUserNotifications);

// Create a new notification
router.post("/", authMiddleware, createNotification);

// Save notification settings
router.post("/settings", authMiddleware, saveSettings);

// Mark all notifications as read
router.put("/read", authMiddleware, markAsRead);

// Delete notifications with 'undefined' in message (cleanup old broken ones)
router.delete("/cleanup", authMiddleware, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.id,
      message: { $regex: "undefined", $options: "i" }
    });
    res.json({ message: `Cleaned up ${result.deletedCount} broken notification(s)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cleanup notifications" });
  }
});

// Delete all notifications for user
router.delete("/all", authMiddleware, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: `Deleted ${result.deletedCount} notification(s)` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete notifications" });
  }
});

// Manually trigger deadline reminder check
router.post("/check-reminders", authMiddleware, async (req, res) => {
  try {
    const { checkDeadlineReminders } = require("../services/reminderScheduler");
    await checkDeadlineReminders();
    res.json({ message: "Deadline reminder check completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to check reminders" });
  }
});

module.exports = router;

