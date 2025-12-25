// server/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  createNotification,
  getSettings,
  saveSettings,
} = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

// Get all notifications and settings for user
router.get("/", authMiddleware, getUserNotifications);

// Create a new notification
router.post("/", authMiddleware, createNotification);

// Save notification settings
router.post("/settings", authMiddleware, saveSettings);

module.exports = router;
