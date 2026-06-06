const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const { connectDatabase, disconnectDatabase } = require("./database/connect");
const { initSocket } = require("./realtime/socket");
const { logError } = require("./handler/errorHandler");

const app = express();
const server = http.createServer(app);

/* --------------------------------- Security -------------------------------- */
app.use(helmet());

const corsOptions = {
  origin: config.frontendUrls.includes("*") ? true : config.frontendUrls,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" })); // images are sent as URLs, but allow headroom

// Basic rate limiting to blunt brute-force / abuse.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many attempts. Please try again later." },
});

/* ---------------------------------- Routes --------------------------------- */
app.get("/", (req, res) => res.json({ success: true, message: "Backend for x.com is running." }));
app.get("/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/auth", authLimiter, require("./api/auth"));
app.use("/post", apiLimiter, require("./api/post"));
app.use("/follow", apiLimiter, require("./api/follow"));
app.use("/chat", apiLimiter, require("./api/chat"));
app.use("/explore", apiLimiter, require("./api/explore"));
app.use("/notification", apiLimiter, require("./api/notification"));

// 404 + centralized error handler.
app.use((req, res) => res.status(404).json({ success: false, error: "Not found." }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logError("express", err);
  res.status(500).json({ success: false, error: "An internal server error occurred." });
});

/* ------------------------------- Bootstrapping ------------------------------ */
initSocket(server);

async function start() {
  await connectDatabase();
  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Running on http://localhost:${config.port} (${config.nodeEnv})`);
  });
}

start().catch((err) => {
  logError("startup", err);
  process.exit(1);
});

// Graceful shutdown.
const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n[server] ${signal} received, shutting down…`);
  server.close();
  await disconnectDatabase().catch(() => {});
  process.exit(0);
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

module.exports = app;
