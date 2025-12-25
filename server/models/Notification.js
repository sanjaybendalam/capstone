// server/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String }, // Example: 'goalReminders', 'achievementAlerts', 'businessAlerts'
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const NotificationSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  goalReminders: { type: Boolean, default: true },
  achievementAlerts: { type: Boolean, default: true },
  businessAlerts: { type: Boolean, default: true },
});

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NotificationSettings = mongoose.model(
  "NotificationSettings",
  NotificationSettingsSchema
);
