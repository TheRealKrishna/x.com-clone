const dns = require("dns");
const mongoose = require("mongoose");
const config = require("../config");

let memoryServer = null;

/**
 * Ensure Node can resolve DNS SRV records for `mongodb+srv://` URIs.
 *
 * On some systems (notably Windows behind a VPN, or with an empty resolver
 * config) Node's default DNS resolver returns ECONNREFUSED for the SRV lookup
 * Atlas relies on, even though the OS resolver works fine. Pointing Node at
 * public resolvers as a fallback fixes the connection without touching the OS.
 * Override or disable via DNS_SERVERS (comma-separated, or "off").
 */
function ensureDnsResolvers(uri) {
  if (!uri.startsWith("mongodb+srv://")) return;
  const override = process.env.DNS_SERVERS;
  if (override && override.toLowerCase() === "off") return;

  const fallback = override
    ? override.split(",").map((s) => s.trim()).filter(Boolean)
    : ["1.1.1.1", "8.8.8.8"];

  try {
    const current = dns.getServers();
    // Keep existing servers first, then append fallbacks Node can actually reach.
    const merged = [...new Set([...current, ...fallback])].filter(
      (s) => s && s !== "0.0.0.0" && s !== "::"
    );
    dns.setServers(merged.length ? merged : fallback);
  } catch {
    try {
      dns.setServers(fallback);
    } catch {
      /* leave default resolver in place */
    }
  }
}

/**
 * Connect to MongoDB.
 *
 * Resolution order:
 *   1. If MONGO_URI is set, connect to it (Atlas, Docker, local mongod, etc.).
 *   2. Otherwise, in non-production, spin up an in-process MongoMemoryServer so
 *      the app runs with zero external setup. Data is ephemeral (lost on restart).
 *
 * Retries with backoff instead of the old recursive-immediate-retry loop.
 */
async function connectDatabase() {
  mongoose.set("strictQuery", true);

  let uri = config.mongoUri;

  if (uri) ensureDnsResolvers(uri);

  if (!uri) {
    if (config.isProd) {
      throw new Error("MONGO_URI must be set in production.");
    }
    // Lazy-require so the dependency is only needed in dev.
    const { MongoMemoryServer } = require("mongodb-memory-server");
    // eslint-disable-next-line no-console
    console.log("[db] MONGO_URI not set — starting in-memory MongoDB (data is ephemeral)…");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }

  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      // eslint-disable-next-line no-console
      console.log(`[db] Connected to MongoDB (${memoryServer ? "in-memory" : "external"}).`);
      return;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[db] Connection attempt ${attempt}/${maxAttempts} failed:`, err.message);
      if (attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDatabase, disconnectDatabase };
