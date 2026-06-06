const { body } = require("express-validator");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { phone } = require("phone");

const config = require("../config");
const User = require("../database/models/UserSchema");
const { asyncHandler, isAtLeastAge } = require("../utils/helpers");
const { generateUniqueUsername } = require("../utils/username");

const signToken = (userId) => jwt.sign({ _id: userId }, config.jwtSecret, { expiresIn: "30d" });

// Strip sensitive/internal fields before sending a user to the client.
const publicUser = (userDoc) => {
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.password;
  delete obj.__v;
  return obj;
};

/* ----------------------------- Validation chains ---------------------------- */

const emailValidators = [body("email").isEmail().withMessage("Invalid email address!")];
const phoneValidators = [body("phone").isLength({ min: 1 }).withMessage("Phone number is required!")];
const signupEmailValidators = [
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required!"),
  body("email").isEmail().withMessage("Invalid email address. Please try again."),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),
];
const signupPhoneValidators = [
  body("name").trim().isLength({ min: 1 }).withMessage("Name is required!"),
  body("phone").isLength({ min: 1 }).withMessage("Phone number is required!"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),
];
const loginValidators = [
  body("password").isLength({ min: 8 }).withMessage("Wrong password!"),
];

/* -------------------------------- Controllers ------------------------------- */

const emailValidate = asyncHandler("auth/emailValidate", async (req, res) => {
  const exists = await User.findOne({ email: String(req.body.email).toLowerCase() });
  if (exists) {
    return res.status(400).json({ success: false, error: "Email already exists!" });
  }
  return res.json({ success: true });
});

const phoneValidate = asyncHandler("auth/phoneValidate", async (req, res) => {
  const parsed = phone(req.body.phone, { country: req.body.country });
  if (!parsed.isValid) {
    return res.status(400).json({ success: false, error: "Invalid phone number!" });
  }
  const exists = await User.findOne({ phone: parsed.phoneNumber });
  if (exists) {
    return res.status(400).json({ success: false, error: "Phone number already exists!" });
  }
  return res.json({ success: true });
});

const signUpWithEmail = asyncHandler("auth/signUpWithEmail", async (req, res) => {
  if (!isAtLeastAge(req.body.dob, 13)) {
    return res.status(400).json({ success: false, error: "You must be at least 13 years old!" });
  }
  const email = String(req.body.email).toLowerCase();
  if (await User.findOne({ email })) {
    return res.status(400).json({ success: false, error: "An account already exists with that email." });
  }

  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    name: req.body.name.trim(),
    email,
    password: hashed,
    dob: new Date(req.body.dob),
    username: await generateUniqueUsername(req.body.name),
  });

  return res.json({ success: true, authToken: signToken(user._id) });
});

const signUpWithPhone = asyncHandler("auth/signUpWithPhone", async (req, res) => {
  if (!isAtLeastAge(req.body.dob, 13)) {
    return res.status(400).json({ success: false, error: "You must be at least 13 years old!" });
  }
  const parsed = phone(String(req.body.phone), { country: req.body.country });
  if (!parsed.isValid) {
    return res.status(400).json({ success: false, error: "Invalid phone number!" });
  }
  if (await User.findOne({ phone: parsed.phoneNumber })) {
    return res.status(400).json({ success: false, error: "An account already exists with that phone number." });
  }

  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    name: req.body.name.trim(),
    phone: parsed.phoneNumber,
    password: hashed,
    dob: new Date(req.body.dob),
    username: await generateUniqueUsername(req.body.name),
  });

  return res.json({ success: true, authToken: signToken(user._id) });
});

// Find a user by username, email, or phone (used by login + loginValidate).
const findByIdentifier = async (identifier, country) => {
  const value = String(identifier || "").trim();
  let user = await User.findOne({ username: value.toLowerCase() }).select("+password");
  let method = "Username";
  if (!user) {
    user = await User.findOne({ email: value.toLowerCase() }).select("+password");
    method = "Email";
  }
  if (!user) {
    const parsed = phone(value, { country });
    if (parsed.isValid) {
      user = await User.findOne({ phone: parsed.phoneNumber }).select("+password");
      method = "Phone";
    }
  }
  return { user, method };
};

const loginValidate = asyncHandler("auth/loginValidate", async (req, res) => {
  const { user, method } = await findByIdentifier(req.body.name, req.body.country);
  if (!user) {
    return res.status(400).json({ success: false, error: "Sorry, we could not find your account." });
  }
  if (!user.password) {
    return res.status(400).json({ success: false, error: "Please use Google or Apple login for this account." });
  }
  return res.json({ success: true, method });
});

const login = asyncHandler("auth/login", async (req, res) => {
  const { user } = await findByIdentifier(req.body.name, req.body.country);
  if (!user) {
    return res.status(400).json({ success: false, error: "Sorry, we could not find your account." });
  }
  if (!user.password) {
    return res.status(400).json({
      success: false,
      authError: true,
      error: "Oops! Looks like you signed up using Google or Apple. Please log in with them.",
    });
  }
  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) {
    return res.status(400).json({ success: false, error: "Wrong password!" });
  }
  return res.json({ success: true, authToken: signToken(user._id) });
});

const loginWithGoogle = asyncHandler("auth/loginWithGoogle", async (req, res) => {
  const response = await axios.get(
    "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,birthdays",
    { headers: { Authorization: `Bearer ${req.body.access_token}` } }
  );
  const json = response.data;
  const email = json.emailAddresses?.[0]?.value?.toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, error: "Could not read Google account email." });
  }

  let user = await User.findOne({ email });
  if (!user) {
    const givenName = json.names?.[0]?.givenName || email.split("@")[0];
    const birthday = json.birthdays?.[0]?.date;
    const dob = birthday
      ? new Date(birthday.year || 2000, (birthday.month || 1) - 1, birthday.day || 1)
      : new Date(2000, 0, 1);
    user = await User.create({
      name: givenName,
      email,
      dob,
      profile: json.photos?.[0]?.url || undefined,
      username: await generateUniqueUsername(givenName),
    });
  }
  return res.json({ success: true, authToken: signToken(user._id) });
});

const getUserInfo = asyncHandler("auth/getUserInfo", async (req, res) =>
  res.json({ success: true, user: publicUser(req.user) })
);

const getUserInfoWithId = asyncHandler("auth/getUserInfoWithId", async (req, res) => {
  const user = await User.findById(req.body._id).select("-__v");
  if (!user) return res.status(404).json({ success: false, error: "User not found!" });
  return res.json({ success: true, user: publicUser(user) });
});

const getUserInfoWithUsername = asyncHandler("auth/getUserInfoWithUsername", async (req, res) => {
  const user = await User.findOne({ username: String(req.body.username).toLowerCase() }).select("-__v");
  if (!user) return res.status(404).json({ success: false, error: "User not found!" });
  return res.json({ success: true, user: publicUser(user) });
});

const editProfile = asyncHandler("auth/editProfile", async (req, res) => {
  const user = req.user;
  const { name, bio, location, website, profile, banner, dob } = req.body;

  if (!name || name.trim().length < 1) {
    return res.status(400).json({ success: false, error: "Name is required!" });
  }
  if (dob && !isAtLeastAge(dob, 13)) {
    return res.status(400).json({ success: false, error: "You must be at least 13 years old!" });
  }

  user.name = name.trim();
  if (typeof bio === "string") user.bio = bio;
  if (typeof location === "string") user.location = location;
  if (typeof website === "string") user.website = website;
  // profile/banner come back as a URL (uploaded) or false (unchanged) or "" (removed).
  if (profile) user.profile = profile;
  if (banner === "") user.banner = "";
  else if (banner) user.banner = banner;
  if (dob) user.dob = new Date(dob);

  await user.save();
  return res.json({ success: true, user: publicUser(user) });
});

module.exports = {
  emailValidators,
  phoneValidators,
  signupEmailValidators,
  signupPhoneValidators,
  loginValidators,
  emailValidate,
  phoneValidate,
  signUpWithEmail,
  signUpWithPhone,
  loginValidate,
  login,
  loginWithGoogle,
  getUserInfo,
  getUserInfoWithId,
  getUserInfoWithUsername,
  editProfile,
  publicUser,
};
