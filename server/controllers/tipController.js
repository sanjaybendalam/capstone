const Tip = require("../models/Tip");
const User = require("../models/User");

// Add a new tip
exports.addTip = async (req, res) => {
  try {
    const { content, tags } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const tip = await Tip.create({
      authorId: req.user.id,
      content,
      tags,
    });

    res.status(201).json(tip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tips
exports.getTips = async (req, res) => {
  try {
    const tips = await Tip.find().sort({ createdAt: -1 }).populate("authorId", "name");
    res.json(tips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get tips from organization employees only (for business users)
exports.getOrganizationTips = async (req, res) => {
  try {
    const businessUser = await User.findById(req.user.id);
    if (!businessUser || businessUser.role !== "business") {
      return res.status(403).json({ message: "Business account required" });
    }

    // Get all employees in this organization
    const employees = await User.find({ organizationId: businessUser._id }).select("_id");
    const employeeIds = employees.map(e => e._id);

    // Get tips from these employees
    const tips = await Tip.find({ authorId: { $in: employeeIds } })
      .sort({ createdAt: -1 })
      .populate("authorId", "name email");

    res.json(tips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Search tips
exports.searchTips = async (req, res) => {
  try {
    const { q } = req.query;
    const tips = await Tip.find({ content: { $regex: q, $options: "i" } }).populate("authorId", "name");
    res.json(tips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Like a tip
exports.likeTip = async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) return res.status(404).json({ message: "Tip not found" });

    tip.likes += 1;
    await tip.save();

    res.json(tip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

