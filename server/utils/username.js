const User = require("../database/models/UserSchema");

/**
 * Generate a unique, URL-safe username derived from a display name or email.
 * Strips non-alphanumerics, lowercases, truncates, and appends random digits
 * until an unused username is found.
 */
async function generateUniqueUsername(seed) {
  const base =
    String(seed || "user")
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
      .slice(0, 12) || "user";

  // Try the bare base first, then base + random suffix.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const suffix = attempt === 0 ? "" : Math.floor(1000 + Math.random() * 9000).toString();
    const candidate = `${base}${suffix}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
  }
  // Extremely unlikely fallback.
  return `${base}${Date.now()}`;
}

module.exports = { generateUniqueUsername };
