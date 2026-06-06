const mongoose = require("mongoose");
const Post = require("../database/models/PostSchema");
const User = require("../database/models/UserSchema");
const { asyncHandler } = require("../utils/helpers");
const { createNotification, removeNotification } = require("../utils/notify");

const SENDER_FIELDS = "name username profile verified";

/**
 * Shape a post document for the client, adding `liked`/`reposted`/`bookmarked`
 * booleans relative to the requesting user so the UI doesn't need the full arrays.
 */
const shapePost = (post, userId, bookmarkSet = null) => {
  const obj = post.toObject ? post.toObject() : post;
  const uid = String(userId);
  return {
    ...obj,
    likeCount: obj.likes?.length || 0,
    repostCount: obj.reposts?.length || 0,
    viewCount: obj.views?.length || 0,
    liked: (obj.likes || []).some((id) => String(id) === uid),
    reposted: (obj.reposts || []).some((id) => String(id) === uid),
    bookmarked: bookmarkSet ? bookmarkSet.has(String(obj._id)) : undefined,
    // Don't ship the full id arrays to the client.
    likes: undefined,
    reposts: undefined,
    views: undefined,
  };
};

const getBookmarkSet = async (userId) => {
  const user = await User.findById(userId).select("bookmarks");
  return new Set((user?.bookmarks || []).map((id) => String(id)));
};

/* -------------------------------- Feed / lists ------------------------------ */

const getPosts = asyncHandler("post/getPosts", async (req, res) => {
  const { filter } = req.body; // "following" | undefined (for-you)
  const query = { parent: null };

  if (filter === "following") {
    const me = await User.findById(req.user._id).select("following");
    query.sender = { $in: [...(me.following || []), req.user._id] };
  }

  const posts = await Post.find(query).populate("sender", SENDER_FIELDS).sort({ createdAt: -1 }).limit(100);
  const bookmarkSet = await getBookmarkSet(req.user._id);
  return res.json({ success: true, posts: posts.map((p) => shapePost(p, req.user._id, bookmarkSet)) });
});

const getUserPosts = asyncHandler("post/getUserPosts", async (req, res) => {
  const { _id, tab } = req.body; // tab: "posts" | "replies" | "likes" | "media"
  const bookmarkSet = await getBookmarkSet(req.user._id);
  let posts;

  if (tab === "replies") {
    posts = await Post.find({ sender: _id, parent: { $ne: null } })
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: -1 });
  } else if (tab === "likes") {
    posts = await Post.find({ likes: _id }).populate("sender", SENDER_FIELDS).sort({ createdAt: -1 });
  } else if (tab === "media") {
    posts = await Post.find({ sender: _id, "images.0": { $exists: true } })
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: -1 });
  } else {
    // Posts + reposts by this user, newest first.
    posts = await Post.find({ $or: [{ sender: _id, parent: null }, { reposts: _id }] })
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: -1 });
  }

  return res.json({ success: true, posts: posts.map((p) => shapePost(p, req.user._id, bookmarkSet)) });
});

const getPost = asyncHandler("post/getPost", async (req, res) => {
  const post = await Post.findById(req.body._id).populate("sender", SENDER_FIELDS);
  if (!post) return res.status(404).json({ success: false, error: "Post not found." });

  const bookmarkSet = await getBookmarkSet(req.user._id);
  const replies = await Post.find({ parent: post._id })
    .populate("sender", SENDER_FIELDS)
    .sort({ createdAt: 1 });

  // Build ancestor chain (for thread context) by walking up parents.
  const ancestors = [];
  let cursor = post.parent;
  while (cursor) {
    // eslint-disable-next-line no-await-in-loop
    const parent = await Post.findById(cursor).populate("sender", SENDER_FIELDS);
    if (!parent) break;
    ancestors.unshift(shapePost(parent, req.user._id, bookmarkSet));
    cursor = parent.parent;
  }

  return res.json({
    success: true,
    post: shapePost(post, req.user._id, bookmarkSet),
    replies: replies.map((p) => shapePost(p, req.user._id, bookmarkSet)),
    ancestors,
  });
});

/* --------------------------------- Mutations -------------------------------- */

const addPost = asyncHandler("post/addPost", async (req, res) => {
  const message = (req.body.message || "").trim();
  const images = Array.isArray(req.body.images) ? req.body.images : [];
  if (message.length === 0 && images.length === 0) {
    return res.status(400).json({ success: false, error: "A message or image is required!" });
  }
  if (message.length > 280) {
    return res.status(400).json({ success: false, error: "Posts cannot exceed 280 characters." });
  }

  const post = await Post.create({ sender: req.user._id, message, images });
  await post.populate("sender", SENDER_FIELDS);

  // Notify any @mentioned users.
  const mentions = message.match(/@([a-zA-Z0-9_]+)/g) || [];
  if (mentions.length) {
    const usernames = [...new Set(mentions.map((m) => m.slice(1).toLowerCase()))];
    const mentioned = await User.find({ username: { $in: usernames } }).select("_id");
    await Promise.all(
      mentioned.map((u) =>
        createNotification({ recipient: u._id, actor: req.user._id, type: "mention", post: post._id })
      )
    );
  }

  return res.json({ success: true, post: shapePost(post, req.user._id) });
});

const addReply = asyncHandler("post/addReply", async (req, res) => {
  const message = (req.body.message || "").trim();
  const images = Array.isArray(req.body.images) ? req.body.images : [];
  if (message.length === 0 && images.length === 0) {
    return res.status(400).json({ success: false, error: "A message or image is required!" });
  }

  const parent = await Post.findById(req.body._id);
  if (!parent) return res.status(404).json({ success: false, error: "Post not found." });

  const reply = await Post.create({ sender: req.user._id, message, images, parent: parent._id });
  parent.replyCount = (parent.replyCount || 0) + 1;
  await parent.save();
  await reply.populate("sender", SENDER_FIELDS);

  await createNotification({
    recipient: parent.sender,
    actor: req.user._id,
    type: "reply",
    post: parent._id,
  });

  return res.json({ success: true, post: shapePost(reply, req.user._id) });
});

const addView = asyncHandler("post/addView", async (req, res) => {
  const post = await Post.findById(req.body._id);
  if (!post) return res.status(404).json({ success: false, error: "Post not found." });
  await Post.updateOne({ _id: post._id }, { $addToSet: { views: req.user._id } });
  return res.json({ success: true });
});

const addLike = asyncHandler("post/addLike", async (req, res) => {
  const post = await Post.findById(req.body._id);
  if (!post) return res.status(404).json({ success: false, error: "Post not found." });

  await Post.updateOne({ _id: post._id }, { $addToSet: { likes: req.user._id } });
  await createNotification({ recipient: post.sender, actor: req.user._id, type: "like", post: post._id });
  return res.json({ success: true });
});

const removeLike = asyncHandler("post/removeLike", async (req, res) => {
  const post = await Post.findById(req.body._id);
  if (!post) return res.status(404).json({ success: false, error: "Post not found." });

  await Post.updateOne({ _id: post._id }, { $pull: { likes: req.user._id } });
  await removeNotification({ recipient: post.sender, actor: req.user._id, type: "like", post: post._id });
  return res.json({ success: true });
});

const toggleRepost = asyncHandler("post/toggleRepost", async (req, res) => {
  const post = await Post.findById(req.body._id);
  if (!post) return res.status(404).json({ success: false, error: "Post not found." });

  const already = post.reposts.some((id) => String(id) === String(req.user._id));
  if (already) {
    await Post.updateOne({ _id: post._id }, { $pull: { reposts: req.user._id } });
    await removeNotification({ recipient: post.sender, actor: req.user._id, type: "repost", post: post._id });
    return res.json({ success: true, reposted: false });
  }
  await Post.updateOne({ _id: post._id }, { $addToSet: { reposts: req.user._id } });
  await createNotification({ recipient: post.sender, actor: req.user._id, type: "repost", post: post._id });
  return res.json({ success: true, reposted: true });
});

const toggleBookmark = asyncHandler("post/toggleBookmark", async (req, res) => {
  const post = await Post.findById(req.body._id);
  if (!post) return res.status(404).json({ success: false, error: "Post not found." });

  const user = await User.findById(req.user._id).select("bookmarks");
  const already = user.bookmarks.some((id) => String(id) === String(post._id));
  if (already) {
    await User.updateOne({ _id: user._id }, { $pull: { bookmarks: post._id } });
    return res.json({ success: true, bookmarked: false });
  }
  await User.updateOne({ _id: user._id }, { $addToSet: { bookmarks: post._id } });
  return res.json({ success: true, bookmarked: true });
});

const getBookmarks = asyncHandler("post/getBookmarks", async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "bookmarks",
    populate: { path: "sender", select: SENDER_FIELDS },
    options: { sort: { createdAt: -1 } },
  });
  const bookmarkSet = new Set((user.bookmarks || []).map((p) => String(p._id)));
  const posts = (user.bookmarks || [])
    .filter((p) => p && p.sender)
    .map((p) => shapePost(p, req.user._id, bookmarkSet));
  return res.json({ success: true, posts });
});

const deletePost = asyncHandler("post/deletePost", async (req, res) => {
  const post = await Post.findById(req.body._id);
  if (!post) return res.status(404).json({ success: false, error: "Post not found." });
  if (String(post.sender) !== String(req.user._id)) {
    return res.status(403).json({ success: false, error: "You can only delete your own posts." });
  }
  if (post.parent) {
    await Post.updateOne({ _id: post.parent }, { $inc: { replyCount: -1 } });
  }
  await Post.deleteMany({ $or: [{ _id: post._id }, { parent: post._id }] });
  return res.json({ success: true });
});

module.exports = {
  getPosts,
  getUserPosts,
  getPost,
  addPost,
  addReply,
  addView,
  addLike,
  removeLike,
  toggleRepost,
  toggleBookmark,
  getBookmarks,
  deletePost,
};
