const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  name: String,
  email: String,
  avatar: String,
  isOnline: { type: Boolean, default: false },
});
module.exports = mongoose.model("User", userSchema);
