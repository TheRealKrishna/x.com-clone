const Notification = require("../database/models/NotificationSchema");
const { asyncHandler } = require("../utils/helpers");

const getNotifications = asyncHandler("notification/getNotifications", async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("actor", "name username profile verified")
    .populate("post", "message images")
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  return res.json({ success: true, notifications, unreadCount });
});

const getUnreadCount = asyncHandler("notification/getUnreadCount", async (req, res) => {
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
  return res.json({ success: true, unreadCount });
});

const markAllRead = asyncHandler("notification/markAllRead", async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
  return res.json({ success: true });
});

module.exports = { getNotifications, getUnreadCount, markAllRead };
