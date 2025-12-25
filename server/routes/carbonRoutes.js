const express = require("express");
const router = express.Router();
const { addCarbonEntry, getUserCarbonEntries } = require("../services/carbon.service");
const authMiddleware = require("../middlewares/authMiddleware");

// Save carbon entries
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = req.body; // { electricity: 5, petrol: 10, ... }
    const savedEntries = await addCarbonEntry(userId, entries);
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

module.exports = router;
