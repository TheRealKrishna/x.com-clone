const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser");
const ctrl = require("../controller/post");

// Feeds & reads
router.post("/getposts", getUser, ctrl.getPosts);
router.post("/getuserposts", getUser, ctrl.getUserPosts);
router.post("/getpost", getUser, ctrl.getPost);
router.post("/getbookmarks", getUser, ctrl.getBookmarks);

// Create
router.post("/addpost", getUser, ctrl.addPost);
router.post("/addreply", getUser, ctrl.addReply);

// Engagement
router.post("/addview", getUser, ctrl.addView);
router.post("/addlike", getUser, ctrl.addLike);
router.post("/removelike", getUser, ctrl.removeLike);
router.post("/togglerepost", getUser, ctrl.toggleRepost);
router.post("/togglebookmark", getUser, ctrl.toggleBookmark);

// Delete
router.post("/deletepost", getUser, ctrl.deletePost);

module.exports = router;
