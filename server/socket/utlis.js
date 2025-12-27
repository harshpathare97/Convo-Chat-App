function getSocketsByUserId(usersSocketMap, userId) {
  return [...usersSocketMap.entries()]
    .filter(([, id]) => id === userId)
    .map(([socketId]) => socketId);
}

module.exports = { getSocketsByUserId };
