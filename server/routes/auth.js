const express = require("express");
const User = require("../models/User");
const Message = require("../models/Message");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = new User({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        isOnline: true,
      });
      await user.save();
    }

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token: authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { isOnline: true });
    const user = await User.findById(req.userId).select("-googleId");

    const userList = await User.find(
      { _id: { $ne: user._id } },
      "_id name avatar isOnline"
    ).lean();

    const userMessages = await Message.find({
      $or: [{ receiverId: req.userId }, { senderId: req.userId }],
    }).lean();

    res.json({ user, userList, userMessages });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/me", async (req, res) => {
  try {
    const { googleId } = await req.body;

    const user = await User.findOne({ googleId });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token: authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
