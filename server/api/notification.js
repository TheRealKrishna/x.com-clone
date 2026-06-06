const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser");
const ctrl = require("../controller/notification");

router.post("/get", getUser, ctrl.getNotifications);
router.post("/unreadcount", getUser, ctrl.getUnreadCount);
router.post("/markallread", getUser, ctrl.markAllRead);

module.exports = router;
