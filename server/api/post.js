const express = require('express')
const app = express()
const {body} = require('express-validator');
const {getPosts, addPost} = require("../controller/post.js")
const getUser = require("../middleware/getUser.js")


app.post("/getposts", getUser, getPosts)

app.post("/addpost", getUser, addPost)


module.exports = app