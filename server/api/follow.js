const express = require('express')
const app = express()
const getUser = require("../middleware/getUser.js")
const { addFollower, removeFollower, getFollowers, getFollownig } = require("../controller/follow.js")


app.post("/addfollower", getUser, addFollower)
app.post("/removefollower", getUser, removeFollower)
app.post("/getfollowers", getUser, getFollowers)
app.post("/getfollowing", getUser, getFollownig)

module.exports = app