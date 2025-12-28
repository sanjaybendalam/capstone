const Tip = require("../models/Tip");
const User = require("../models/User");

// Add a new tip
exports.addTip = async (req, res) => {
  try {
    const { content, tags } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const user = await User.findById(req.user.id);

    // If business user, set organizationId to their own ID (tips for their org only)
    const organizationId = user.role === "business" ? user._id : null;

    const tip = await Tip.create({
      authorId: req.user.id,
      content,
      tags,
      organizationId
    });

    res.status(201).json(tip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all tips (for regular users - public tips + tips from their org admin)
exports.getTips = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let query;
    if (user.organizationId) {
      // User is part of an org - show public tips AND tips from their org admin
      query = {
        $or: [
          { organizationId: null },
          { organizationId: user.organizationId }
        ]
      };
    } else {
      // User is not part of any org - show only public tips
      query = { organizationId: null };
    }

    const tips = await Tip.find(query)
      .sort({ createdAt: -1 })
      .populate("authorId", "name");

    // Add isLiked field for each tip
    const tipsWithLikeStatus = tips.map(tip => ({
      ...tip.toObject(),
      isLiked: tip.likedBy.includes(req.user.id)
    }));

    res.json(tipsWithLikeStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get tips from organization employees AND business admin (for business users)
exports.getOrganizationTips = async (req, res) => {
  try {
    const businessUser = await User.findById(req.user.id);
    if (!businessUser || businessUser.role !== "business") {
      return res.status(403).json({ message: "Business account required" });
    }

    // Get all employees in this organization
    const employees = await User.find({ organizationId: businessUser._id }).select("_id");
    const employeeIds = employees.map(e => e._id);

    // Get tips from employees AND tips shared by the business admin for this org
    const tips = await Tip.find({
      $or: [
        { authorId: { $in: employeeIds } },
        { authorId: businessUser._id, organizationId: businessUser._id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("authorId", "name email");

    // Add isLiked field
    const tipsWithLikeStatus = tips.map(tip => ({
      ...tip.toObject(),
      isLiked: tip.likedBy.includes(req.user.id)
    }));

    res.json(tipsWithLikeStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Search tips
exports.searchTips = async (req, res) => {
  try {
    const { q } = req.query;
    const user = await User.findById(req.user.id);

    let baseQuery;
    if (user.organizationId) {
      baseQuery = {
        $or: [
          { organizationId: null },
          { organizationId: user.organizationId }
        ]
      };
    } else {
      baseQuery = { organizationId: null };
    }

    const tips = await Tip.find({
      ...baseQuery,
      content: { $regex: q, $options: "i" }
    }).populate("authorId", "name");

    const tipsWithLikeStatus = tips.map(tip => ({
      ...tip.toObject(),
      isLiked: tip.likedBy.includes(req.user.id)
    }));

    res.json(tipsWithLikeStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Toggle like on a tip
exports.likeTip = async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) return res.status(404).json({ message: "Tip not found" });

    const userId = req.user.id;
    const alreadyLiked = tip.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike - remove from likedBy and decrement
      tip.likedBy = tip.likedBy.filter(id => id.toString() !== userId);
      tip.likes = Math.max(0, tip.likes - 1);
    } else {
      // Like - add to likedBy and increment
      tip.likedBy.push(userId);
      tip.likes += 1;
    }

    await tip.save();

    res.json({
      ...tip.toObject(),
      isLiked: !alreadyLiked
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
