const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Goal", goalSchema);
