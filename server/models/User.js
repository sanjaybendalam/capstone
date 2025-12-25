const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  role: { type: String, enum: ["user", "business"], default: "user" },

  otp: String,
  otpExpiry: Date,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
