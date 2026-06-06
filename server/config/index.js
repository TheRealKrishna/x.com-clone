const path = require("path");
const dotenv = require("dotenv");

// Load .env.local first (developer overrides, gitignored), then .env as fallback.
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  // Comma-separated list of allowed origins, or "*" for any.
  frontendUrls: (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
};

// JWT_SECRET is mandatory for any real deployment. In development we fall back to
// an ephemeral secret so the app runs zero-config, but warn loudly.
if (!config.jwtSecret) {
  if (config.isProd) {
    throw new Error("JWT_SECRET must be set in production.");
  }
  config.jwtSecret = "dev-only-insecure-secret-change-me";
  // eslint-disable-next-line no-console
  console.warn(
    "[config] JWT_SECRET not set — using an insecure development secret. " +
      "Set JWT_SECRET in server/.env.local for anything real."
  );
}

module.exports = config;
