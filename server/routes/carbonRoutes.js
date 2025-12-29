const express = require("express");
const router = express.Router();
const { addCarbonEntry, getUserCarbonEntries } = require("../services/carbon.service");
const authMiddleware = require("../middlewares/authMiddleware");
const Goal = require("../models/Goal");
const CarbonEntry = require("../models/CarbonEntry");
const Notification = require("../models/Notification");

// Save carbon entries
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = req.body; // { electricity: 5, petrol: 10, ... }
    const savedEntries = await addCarbonEntry(userId, entries);

    // Auto-update goal progress based on carbon entries
    await updateGoalProgress(userId);

    res.json(savedEntries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get user entries
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await getUserCarbonEntries(userId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Helper function to update goal progress based on carbon entries
async function updateGoalProgress(userId) {
  try {
    // Get all category-linked goals for this user
    const goals = await Goal.find({
      userId,
      category: { $ne: null },
      status: "pending"
    });

    for (const goal of goals) {
      // Calculate total CO2 for this category
      const entries = await CarbonEntry.find({ userId, category: goal.category });
      const totalCO2 = entries.reduce((sum, entry) => sum + (entry.calculatedCO2 || 0), 0);

      const wasCompleted = goal.status === "completed";
      goal.currentValue = parseFloat(totalCO2.toFixed(2));

      // Auto-complete if target reached
      if (goal.currentValue >= goal.targetValue) {
        goal.status = "completed";
      }

      await goal.save();

      // Create notification if goal was just completed
      if (!wasCompleted && goal.status === "completed") {
        const notification = new Notification({
          userId: goal.userId,
          type: "achievementAlerts",
          message: `🎉 Congratulations! You achieved your goal: "${goal.title}"`
        });
        await notification.save();
      }
    }
  } catch (err) {
    console.error("Error updating goal progress:", err);
  }
}

// Delete today's carbon entries
router.delete("/today", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Delete all entries from today using 'date' field
    const result = await CarbonEntry.deleteMany({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    // Update goal progress after deletion
    await updateGoalProgress(userId);

    res.json({
      message: `Deleted ${result.deletedCount} entries from today`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete today's entries" });
  }
});

module.exports = router;

