const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser");
const ctrl = require("../controller/explore");

router.post("/search", getUser, ctrl.search);
router.post("/trends", getUser, ctrl.getTrends);

module.exports = router;
