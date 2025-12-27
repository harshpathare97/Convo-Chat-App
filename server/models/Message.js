const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  message: String,
  status: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  expireAt: {
    type: Date,
    index: { expires: 0 },
  },
});

module.exports = mongoose.model("Message", messageSchema);
