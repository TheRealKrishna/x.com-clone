const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      // Sparse unique index: enforces uniqueness only on documents that have an email.
      unique: true,
      sparse: true,
      default: undefined,
      // Required only if no phone is present (validated at the controller level too).
      validate: {
        validator: function validateEmailOrPhone(value) {
          return Boolean(value) || Boolean(this.phone);
        },
        message: "Either an email or a phone number is required.",
      },
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
    },
    password: {
      type: String,
      // Not required: OAuth (Google/Apple) accounts have no password.
      default: undefined,
      select: false, // never returned by default queries
    },
    dob: {
      type: Date,
      required: true,
    },
    profile: {
      type: String,
      default:
        "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
    },
    banner: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 160,
    },
    website: {
      type: String,
      default: "",
      maxlength: 100,
    },
    location: {
      type: String,
      default: "",
      maxlength: 30,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    // Map of contactUserId -> unread message count.
    unreadMessages: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, minimize: false }
);

// Convenience text index for user search (name + username).
UserSchema.index({ name: "text", username: "text" });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;
