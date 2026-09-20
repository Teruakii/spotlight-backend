require("dotenv").config();
const express = require("express");
const cors = require("cors");
const container = require("./src/container/container");
const createRouter = require("./src/interfaces/http/routes");
const errorHandler = require("./src/interfaces/http/middlewares/error-handler");

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  }),
);

app.use(express.json());
app.use("/api", createRouter(container));
app.use(errorHandler);

if (require.main === module) {
  const server = app.listen(process.env.PORT || 3000, () =>
    console.log("Server running on port " + (process.env.PORT || 3000)),
  );

  const shutdown = async (signal) => {
    console.log(`${signal} received: closing server...`);
    server.close(() => console.log("HTTP server closed"));
    await container.prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

module.exports = app;