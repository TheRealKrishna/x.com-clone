const mongoose = require("mongoose");
const config = require("../config");

let memoryServer = null;

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
