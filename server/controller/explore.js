const Post = require("../database/models/PostSchema");
const User = require("../database/models/UserSchema");
const { asyncHandler } = require("../utils/helpers");

const SENDER_FIELDS = "name username profile verified";
const USER_FIELDS = "name username profile bio verified followers following";

const shapePost = (post, userId) => {
  const obj = post.toObject ? post.toObject() : post;
  const uid = String(userId);
  return {
    ...obj,
    likeCount: obj.likes?.length || 0,
    repostCount: obj.reposts?.length || 0,
    viewCount: obj.views?.length || 0,
    liked: (obj.likes || []).some((id) => String(id) === uid),
    reposted: (obj.reposts || []).some((id) => String(id) === uid),
    likes: undefined,
    reposts: undefined,
    views: undefined,
  };
};

// Escape user input before using it in a RegExp.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const search = asyncHandler("explore/search", async (req, res) => {
  const q = (req.body.query || "").trim();
  const type = req.body.type || "all"; // "all" | "users" | "posts"
  if (!q) return res.json({ success: true, users: [], posts: [] });

  const rx = new RegExp(escapeRegex(q), "i");
  const result = { success: true };

  if (type === "all" || type === "users") {
    result.users = await User.find({ $or: [{ name: rx }, { username: rx }] })
      .select(USER_FIELDS)
      .limit(20);
  }
  if (type === "all" || type === "posts") {
    // Support "#tag" queries by stripping the leading '#'.
    const tag = q.startsWith("#") ? q.slice(1).toLowerCase() : null;
    const postQuery = tag ? { hashtags: tag } : { message: rx, parent: null };
    const posts = await Post.find(postQuery)
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: -1 })
      .limit(30);
    result.posts = posts.map((p) => shapePost(p, req.user._id));
  }

  return res.json(result);
});

// Trending hashtags by frequency across all posts.
const getTrends = asyncHandler("explore/getTrends", async (req, res) => {
  const trends = await Post.aggregate([
    { $unwind: "$hashtags" },
    { $group: { _id: "$hashtags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, tag: "$_id", count: 1 } },
  ]);
  return res.json({ success: true, trends });
});

module.exports = { search, getTrends };
