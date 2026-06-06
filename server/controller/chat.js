const User = require("../database/models/UserSchema");
const Chat = require("../database/models/ChatSchema");
const { asyncHandler } = require("../utils/helpers");
const { emitToUser } = require("../realtime/socket");

const CONTACT_FIELDS = "name username profile bio verified joined createdAt followers";

/**
 * Return the user's contacts, each enriched with the last message preview,
 * its timestamp, and the unread count for that conversation.
 */
const getContacts = asyncHandler("chat/getContacts", async (req, res) => {
  const user = await User.findById(req.user._id).populate("contacts", CONTACT_FIELDS);
  if (!user) return res.status(404).json({ success: false, error: "User not found." });

  const unread = user.unreadMessages || {};
  const contacts = await Promise.all(
    (user.contacts || []).map(async (contact) => {
      const chat = await Chat.findOne({ members: { $all: [user._id, contact._id] } })
        .select("messages lastMessageAt")
        .lean();
      const last = chat?.messages?.[chat.messages.length - 1] || null;
      return {
        ...contact.toObject(),
        lastMessage: last ? last.message : null,
        lastMessageAt: chat?.lastMessageAt || null,
        unreadCount: unread[String(contact._id)] || 0,
      };
    })
  );

  // Sort by most recent conversation activity.
  contacts.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
  return res.json({ success: true, contacts });
});

const getMessages = asyncHandler("chat/getMessages", async (req, res) => {
  const contact = await User.findById(req.body._id);
  if (!contact) return res.status(404).json({ success: false, error: "User not found." });

  const chat = await Chat.findOne({ members: { $all: [req.user._id, contact._id] } });
  if (!chat) return res.json({ success: true, messages: [] });

  // Mark all messages from the contact as read and clear unread counter.
  let changed = false;
  chat.messages.forEach((m) => {
    if (String(m.sender) !== String(req.user._id) && !m.read) {
      m.read = true;
      changed = true;
    }
  });
  if (changed) await chat.save();

  const user = await User.findById(req.user._id).select("unreadMessages");
  if (user.unreadMessages?.[String(contact._id)]) {
    delete user.unreadMessages[String(contact._id)];
    user.markModified("unreadMessages");
    await user.save();
  }

  // Let the contact know their messages were read (read receipts).
  emitToUser(contact._id, "messagesRead", { by: String(req.user._id) });

  return res.json({ success: true, messages: chat.messages });
});

const addContact = asyncHandler("chat/addContact", async (req, res) => {
  const contact = await User.findById(req.body._id);
  if (!contact) return res.status(404).json({ success: false, error: "User not found." });

  await User.updateOne({ _id: req.user._id }, { $addToSet: { contacts: contact._id } });
  await User.updateOne({ _id: contact._id }, { $addToSet: { contacts: req.user._id } });
  return res.json({ success: true });
});

// Send a message; creates the chat if it doesn't exist yet.
const sendMessage = asyncHandler("chat/sendMessage", async (req, res) => {
  const text = (req.body.message || "").trim();
  if (!text) return res.status(400).json({ success: false, error: "Message cannot be empty." });

  const contact = await User.findById(req.body._id);
  if (!contact) return res.status(404).json({ success: false, error: "User not found." });

  let chat = await Chat.findOne({ members: { $all: [req.user._id, contact._id] } });
  if (!chat) {
    chat = new Chat({ members: [req.user._id, contact._id], messages: [] });
    // Make them mutual contacts on first message.
    await User.updateOne({ _id: req.user._id }, { $addToSet: { contacts: contact._id } });
    await User.updateOne({ _id: contact._id }, { $addToSet: { contacts: req.user._id } });
  }

  const message = { sender: req.user._id, message: text, read: false };
  chat.messages.push(message);
  chat.lastMessageAt = new Date();
  await chat.save();
  const saved = chat.messages[chat.messages.length - 1];

  // Increment recipient's unread counter.
  const contactDoc = await User.findById(contact._id).select("unreadMessages");
  const unread = contactDoc.unreadMessages || {};
  unread[String(req.user._id)] = (unread[String(req.user._id)] || 0) + 1;
  contactDoc.unreadMessages = unread;
  contactDoc.markModified("unreadMessages");
  await contactDoc.save();

  // Real-time push to the recipient.
  emitToUser(contact._id, "newMessage", {
    from: String(req.user._id),
    message: saved,
  });

  return res.json({ success: true, message: saved, messages: chat.messages });
});

module.exports = { getContacts, getMessages, addContact, sendMessage };
