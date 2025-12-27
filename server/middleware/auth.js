const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
const authHeader = req.headers.authorization;
const token = authHeader && authHeader.startsWith('Bearer ')
  ? authHeader.split(' ')[1]
  : null;
  if (!token) return res.status(401).json({ error: "Please authenticate using a valid token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};
