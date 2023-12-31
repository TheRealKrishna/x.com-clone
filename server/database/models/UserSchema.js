const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: () => {
      return this.email && this.email.length > 0
    },
    required: () => {
      return this.phone && this.phone.length <= 0
    },
    default: ""
  },
  phone: {
    type: String,
    unique: () => {
      return this.phone && this.phone.length > 0
    },
    required: () => {
      return this.email && this.email.length <= 0
    },
    default: ""
  },
  password: {
    type: String,
  },
  dob: {
    type: Date,
    required: true
  },
  profile: {
    type: String,
    default: "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png"
  },
  joined: {
    type: Date,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  banner: {
    type: String,
    default: ""
  },
  website: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  unreadMessages: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
}, { minimize: false });

const User = new mongoose.model("User", UserSchema);
module.exports = User