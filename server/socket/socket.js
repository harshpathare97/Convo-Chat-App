const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const handleSocketEvent = require("./eventHandler");

const usersSocketMap = new Map();

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Auth error"));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      next();
    } catch {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    usersSocketMap.set(socket.id, socket.userId);
    handleSocketEvent(io, socket, usersSocketMap);
  });
}

module.exports = { initializeSocket };
