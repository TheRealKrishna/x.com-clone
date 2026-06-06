const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../database/models/UserSchema");
const { logError } = require("../handler/errorHandler");

/**
 * Authentication middleware.
 *
 * Reads the JWT from the `authtoken` header (case-insensitive), verifies it,
 * loads the user, and attaches it to `req.user`. Responds 401 on any failure
 * instead of throwing (the old version crashed on a missing/invalid token).
 */
const getUser = async (req, res, next) => {
  try {
    const token = req.headers.authtoken || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch {
      return res.status(401).json({ success: false, error: "Invalid or expired session." });
    }

    const user = await User.findById(decoded._id).select("-__v");
    if (!user) {
      return res.status(401).json({ success: false, error: "Account no longer exists." });
    }

    req.user = user;
    return next();
  } catch (error) {
    logError("middleware/getUser", error);
    return res.status(500).json({ success: false, error: "An internal server error occurred." });
  }
};

module.exports = getUser;
