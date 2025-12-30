const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true },
    title: { type: String, required: true },
    targetValue: { type: Number, required: true },
    unit: { type: String, required: true },
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to prevent duplicate achievements for the same goal completion
achievementSchema.index({ userId: 1, goalId: 1, completedAt: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);
