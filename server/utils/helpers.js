const { validationResult } = require("express-validator");
const { logError } = require("../handler/errorHandler");

/**
 * Wrap an async route handler so any thrown/rejected error is caught and turned
 * into a clean 500 JSON response instead of crashing the process.
 */
const asyncHandler = (context, fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    logError(context, error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "An internal server error occurred." });
    }
  }
};

/**
 * Express middleware that returns a 400 with the first validation error message
 * if express-validator found any problems.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  return next();
};

/**
 * Returns true if the given date of birth is at least `minAge` years ago.
 */
const isAtLeastAge = (dob, minAge = 13) => {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return false;
  const now = new Date();
  const threshold = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
  return birth <= threshold;
};

module.exports = { asyncHandler, handleValidation, isAtLeastAge };
