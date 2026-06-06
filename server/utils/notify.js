const Notification = require("../database/models/NotificationSchema");
const { emitToUser } = require("../realtime/socket");

/**
 * Create a notification and push it to the recipient in real time.
 * No-ops when the actor is the recipient (don't notify yourself).
 */
async function createNotification({ recipient, actor, type, post = null }) {
  if (!recipient || !actor) return null;
  if (String(recipient) === String(actor)) return null;

  const notification = await Notification.create({ recipient, actor, type, post });
  const populated = await notification.populate([
    { path: "actor", select: "name username profile verified" },
    { path: "post", select: "message images" },
  ]);

  emitToUser(recipient, "notification", populated);
  return populated;
}

/**
 * Remove a previously created notification (e.g. on unlike/unfollow) so counts
 * don't accumulate stale entries.
 */
async function removeNotification({ recipient, actor, type, post = null }) {
  if (!recipient || !actor) return;
  await Notification.deleteMany({ recipient, actor, type, post });
}

module.exports = { createNotification, removeNotification };
