const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 280,
    },
    images: {
      type: [String],
      default: [],
    },
    // Reply threading: if set, this post is a reply to `parent`.
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
      index: true,
    },
    // Denormalized counters kept in sync alongside the arrays for cheap reads.
    replyCount: {
      type: Number,
      default: 0,
    },
    // Users who reposted this post.
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Extracted #hashtags (lowercased, without the #) for explore/trends.
    hashtags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  { timestamps: true, minimize: false }
);

// Feed queries sort by recency.
PostSchema.index({ createdAt: -1 });
// Text index for post search.
PostSchema.index({ message: "text" });

// Extract hashtags from the message before validation/save.
PostSchema.pre("validate", function extractHashtags(next) {
  if (this.message) {
    const matches = this.message.match(/#[\p{L}\p{N}_]+/gu) || [];
    this.hashtags = [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
  } else {
    this.hashtags = [];
  }
  next();
});

// A post must have either a message or at least one image.
PostSchema.pre("validate", function requireContent(next) {
  const hasMessage = this.message && this.message.trim().length > 0;
  const hasImages = Array.isArray(this.images) && this.images.length > 0;
  if (!hasMessage && !hasImages) {
    return next(new Error("A post must contain a message or at least one image."));
  }
  return next();
});

const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);
module.exports = Post;
