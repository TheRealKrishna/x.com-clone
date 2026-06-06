const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser");
const ctrl = require("../controller/chat");

router.post("/getcontacts", getUser, ctrl.getContacts);
router.post("/getmessages", getUser, ctrl.getMessages);
router.post("/addcontact", getUser, ctrl.addContact);
// Unified send endpoint (creates the chat on first message).
router.post("/sendmessage", getUser, ctrl.sendMessage);

module.exports = router;
