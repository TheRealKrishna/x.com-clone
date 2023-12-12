const express = require('express')
const app = express()
const {body} = require('express-validator');
const { getContacts, getMessages, addContact, createChat, addMessage } = require("../controller/chat.js")
const getUser = require("../middleware/getUser.js")


app.post("/getcontacts",getUser, getContacts)
app.post("/getmessages", getUser, getMessages)
app.post("/addcontact", getUser, addContact)
app.post("/createchat", getUser, createChat)
app.post("/addmessage", getUser, addMessage)

module.exports = app