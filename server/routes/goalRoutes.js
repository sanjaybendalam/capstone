const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const goal = new Goal({ userId: req.user.id, ...req.body });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

// Get all goals for current logged-in user (uses token)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// Get all goals for logged-in user by ID (legacy)
router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// Toggle goal completion status
router.put("/:goalId/toggle", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Toggle status
    goal.status = goal.status === "pending" ? "completed" : "pending";
    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update goal" });
  }
});

// Update goal progress (currentValue)
router.put("/:goalId/progress", authMiddleware, async (req, res) => {
  try {
    const { currentValue } = req.body;
    const goal = await Goal.findById(req.params.goalId);

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Validate current value
    if (currentValue < 0) {
      return res.status(400).json({ message: "Progress value cannot be negative" });
    }

    goal.currentValue = currentValue;

    // Auto-complete goal if target reached
    if (goal.currentValue >= goal.targetValue) {
      goal.status = "completed";
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update goal progress" });
  }
});

// Delete a goal permanently
router.delete("/:goalId", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Verify ownership
    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this goal" });
    }

    await Goal.findByIdAndDelete(req.params.goalId);
    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

module.exports = router;
