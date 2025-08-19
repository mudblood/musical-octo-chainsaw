console.log("user.js loaded");

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// hash password helper
userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

// password check helper
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
