const fs = require("fs");
const path = require("path");
const config = require("../config");

const LOG_FILE = path.join(__dirname, "..", "error_logs.txt");

/**
 * Log an error to the console and append it to error_logs.txt.
 * Appends (does not rewrite the whole file) and never throws.
 */
function logError(context, error) {
  const timestamp = new Date().toISOString();
  const message = error && error.stack ? error.stack : String(error);
  // eslint-disable-next-line no-console
  console.error(`[${timestamp}] [${context}]`, message);

  if (config.isProd) return; // avoid unbounded disk writes in production
  try {
    fs.appendFileSync(LOG_FILE, `[${timestamp}] [${context}] ${message}\n`);
  } catch {
    /* best-effort logging only */
  }
}

module.exports = { logError };
