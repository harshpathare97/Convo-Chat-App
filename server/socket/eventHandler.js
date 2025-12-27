const User = require("../models/User");
const Message = require("../models/Message");
const { getSocketsByUserId } = require("./utlis");
const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

async function handleSocketEvent(io, socket, usersSocketMap) {
  socket.on("user_list", async () => {
    const users = await User.find({}, "_id name avatar isOnline").lean();
    socket.broadcast.emit("user_list", users);
  });

  socket.on("user_typing", (receiverId) => {
    const targetSockets = getSocketsByUserId(usersSocketMap, receiverId);
    targetSockets.forEach((id) => io.to(id).emit("user_typing", socket.userId));
  });

  socket.on("message_send", async (data, callback) => {
    const msg = new Message(data);
    const savedMsg = await msg.save();

    const targetSockets = getSocketsByUserId(usersSocketMap, data.receiverId);
    targetSockets.forEach((id) => io.to(id).emit("message_receive", savedMsg));

    callback(savedMsg);
  });

  socket.on("message_delivered", async ({ receiverId, messageId, status }) => {
    await Message.findByIdAndUpdate(messageId, { status });

    const targetSockets = getSocketsByUserId(usersSocketMap, receiverId);
    targetSockets.forEach((id) =>
      io.to(id).emit("message_delivered", {
        messageId,
        status,
      })
    );
  });

  socket.on("message_seen", async ({ receiverId, messageId, status }) => {
    await Message.findByIdAndUpdate(messageId, { status, expireAt });

    const targetSockets = getSocketsByUserId(usersSocketMap, receiverId);
    targetSockets.forEach((id) =>
      io.to(id).emit("message_seen", {
        messageId,
        status,
      })
    );
  });

  socket.on("disconnect", async () => {
    usersSocketMap.delete(socket.id);
    const stillConnected = [...usersSocketMap.values()].includes(socket.userId);
    if (!stillConnected) {
      await User.findByIdAndUpdate(socket.userId, { isOnline: false });
      const userList = await User.find({}, "_id name avatar isOnline").lean();
      socket.broadcast.emit("user_list", userList);
    }
  });
}

module.exports = handleSocketEvent;
