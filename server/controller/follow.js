const User = require("../database/models/UserSchema");
const { asyncHandler } = require("../utils/helpers");
const { createNotification, removeNotification } = require("../utils/notify");

const PUBLIC_FIELDS = "name username profile bio verified followers following";

const getFollowers = asyncHandler("follow/getFollowers", async (req, res) => {
  const user = await User.findById(req.body._id).populate("followers", PUBLIC_FIELDS);
  if (!user) return res.status(404).json({ success: false, error: "User not found." });
  return res.json({ success: true, followers: user.followers });
});

const getFollowing = asyncHandler("follow/getFollowing", async (req, res) => {
  const user = await User.findById(req.body._id).populate("following", PUBLIC_FIELDS);
  if (!user) return res.status(404).json({ success: false, error: "User not found." });
  return res.json({ success: true, following: user.following });
});

const addFollower = asyncHandler("follow/addFollower", async (req, res) => {
  if (String(req.body._id) === String(req.user._id)) {
    return res.status(400).json({ success: false, error: "You cannot follow yourself." });
  }
  const target = await User.findById(req.body._id);
  if (!target) return res.status(404).json({ success: false, error: "User not found." });

  await User.updateOne({ _id: target._id }, { $addToSet: { followers: req.user._id } });
  await User.updateOne({ _id: req.user._id }, { $addToSet: { following: target._id } });
  await createNotification({ recipient: target._id, actor: req.user._id, type: "follow" });
  return res.json({ success: true });
});

const removeFollower = asyncHandler("follow/removeFollower", async (req, res) => {
  const target = await User.findById(req.body._id);
  if (!target) return res.status(404).json({ success: false, error: "User not found." });

  await User.updateOne({ _id: target._id }, { $pull: { followers: req.user._id } });
  await User.updateOne({ _id: req.user._id }, { $pull: { following: target._id } });
  await removeNotification({ recipient: target._id, actor: req.user._id, type: "follow" });
  return res.json({ success: true });
});

// "Who to follow" — users the current user doesn't already follow.
const getSuggestions = asyncHandler("follow/getSuggestions", async (req, res) => {
  const me = await User.findById(req.user._id).select("following");
  const exclude = [...(me.following || []), req.user._id];
  const suggestions = await User.find({ _id: { $nin: exclude } })
    .select(PUBLIC_FIELDS)
    .sort({ createdAt: -1 })
    .limit(req.body.limit || 5);
  return res.json({ success: true, suggestions });
});

module.exports = { addFollower, removeFollower, getFollowers, getFollowing, getSuggestions };
