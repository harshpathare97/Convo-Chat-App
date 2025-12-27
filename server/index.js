require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectToMongo = require("./db");
const { initializeSocket } = require("./socket/socket");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

connectToMongo();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));

initializeSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
