const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: { type: String, default: null },
  dob: { type: Date, default: null },

  role: { type: String, enum: ["user", "business"], default: "user" },

  // Organization fields
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Links employee to business user
  organizationName: { type: String, default: null }, // Only for business users

  otp: String,
  otpExpiry: Date,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);


