require("dotenv").config();
const express = require("express");
const cors = require("cors");
const container = require("./src/container/container");
const createRouter = require("./src/interfaces/http/routes");
const errorHandler = require("./src/interfaces/http/middlewares/error-handler");

const app = express();
app.use(cors());
app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Spotlight API Server is running", port: process.env.PORT || 5000 });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", createRouter(container));
app.use(errorHandler);

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
  });

  // Ensure event loop does not drain prematurely
  const keepAlive = setInterval(() => {}, 60000);

  server.on("close", () => {
    console.log("[SERVER] Socket closed");
  });

  server.on("error", (err) => {
    console.error("[SERVER] Error:", err);
  });

  process.on("beforeExit", (code) => {
    console.log(`[PROCESS] beforeExit with code: ${code}`);
  });

  process.on("exit", (code) => {
    console.log(`[PROCESS] exit with code: ${code}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received: closing server...`);
    clearInterval(keepAlive);
    server.close(() => console.log("HTTP server closed"));
    await container.prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

module.exports = app;