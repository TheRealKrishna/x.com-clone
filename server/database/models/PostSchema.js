const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: () => {
      return this.images && this.images.length <= 0
    },
  },
  images: {
    type: Array,
    required: () => {
      return this.message && this.message.length <= 0
    },
  },
  timestamp: {
    type: Date,
    required:true,
  },
  replies: {
    type: Number,
    default: 0,
  },
  reposts: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  }

}, { minimize: false });

const Post = new mongoose.model("Post", PostSchema);
module.exports = Post