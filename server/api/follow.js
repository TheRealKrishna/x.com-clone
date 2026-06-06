const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser");
const ctrl = require("../controller/follow");

router.post("/addfollower", getUser, ctrl.addFollower);
router.post("/removefollower", getUser, ctrl.removeFollower);
router.post("/getfollowers", getUser, ctrl.getFollowers);
router.post("/getfollowing", getUser, ctrl.getFollowing);
router.post("/getsuggestions", getUser, ctrl.getSuggestions);

module.exports = router;
