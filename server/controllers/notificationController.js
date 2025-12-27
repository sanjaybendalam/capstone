// server/controllers/notificationController.js
const Notification = require("../models/Notification");
const { NotificationSettings } = require("../models/Notification");

// Get notifications list and settings for user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Get settings
    let settings = await NotificationSettings.findOne({ userId });
    if (!settings) {
      settings = await NotificationSettings.create({ userId });
    }

    res.json({ notifications, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get notifications" });
  }
};

// Create a notification (used when goals are achieved)
exports.createNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, message } = req.body;

    const notification = new Notification({ userId, type, message });
    await notification.save();

    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// Get settings
exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    let settings = await NotificationSettings.findOne({ userId });
    if (!settings) {
      // Default settings
      settings = await NotificationSettings.create({ userId });
    }
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get settings" });
  }
};

// Save/update settings
exports.saveSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    const updated = await NotificationSettings.findOneAndUpdate(
      { userId },
      { ...settings },
      { new: true, upsert: true }
    );

    res.json({ settings: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save settings" });
  }
};

// Mark all notifications as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
};
