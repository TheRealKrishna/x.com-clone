const express = require('express')
const app = express()
const {body} = require('express-validator');
const {getPosts, addPost, addView, addLike, removeLike} = require("../controller/post.js")
const getUser = require("../middleware/getUser.js")


app.post("/getposts", getUser, getPosts)

app.post("/addpost", getUser, addPost)

app.post("/addview", getUser, addView)

app.post("/addlike", getUser, addLike)

app.post("/removelike", getUser, removeLike)


module.exports = app