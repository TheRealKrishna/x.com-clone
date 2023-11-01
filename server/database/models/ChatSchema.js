const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: {
    type: Array,
  }
})

const Chat = new mongoose.model("Chat", ChatSchema);
module.exports = Chat