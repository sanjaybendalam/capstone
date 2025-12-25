const mongoose = require("mongoose");

const CarbonEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  category: {
    type: String,
    enum: ["electricity", "transport", "flight", "fuel", "food", "waste"],
    required: true
  },

  activityData: {
    value: Number,
    unit: String
  },

  emissionFactor: Number,
  calculatedCO2: Number,

  scope: {
    type: Number,
    enum: [1, 2, 3]
  },

  metadata: Object,

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CarbonEntry", CarbonEntrySchema);
