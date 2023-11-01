const User = require("../database/models/UserSchema.js")
const Chat = require("../database/models/ChatSchema.js")
const errorHandler = require("../handler/errorHandler.js")

const getContacts = async (req, res) => {
    try {
        const user = await User.find({}).populate('contacts', '-password -__v')
        if (user) {
            return res.json({ success: true, contacts: user.contacts })
        }
        else {
            return res.json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

const getMessages = async (req, res) => {
    try {
        if (req.body.user) {
            const user = req.body.user;
            const contact = await User.findOne({ _id: req.body._id });
            if (!contact) {
                return res.status(400).json({ success: false, error: 'Invalid request!' })
            }
            const chat = await Chat.findOne({ members: { $all: [user._id, contact._id] } })
            if (!chat) {
                return res.json({ success: true, messages: [] });
            }

            delete user.unreadMessages[contact._id];
            user.markModified('unreadMessages');
            await user.save()

            return res.json({ success: true, messages: chat.messages });
        }
        else {
            return res.json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

const addContact = async (req, res) => {
    try {
        if (req.body.user) {
            const user = req.body.user;
            const contact = await User.findOne({ _id: req.body._id })
            if (!contact) {
                return res.status(400).json({ success: false, error: 'Invalid request.' })
            }
            if (user.contacts.find((obj) => obj._id.equals(contact._id))) {
                await user.contacts.splice(await user.contacts.indexOf(await user.contacts.find((obj) => obj._id.equals(contact._id))), 1);
                await user.contacts.unshift({ _id: contact._id });
            }
            else {
                await user.contacts.unshift({ _id: contact._id });
            }
            if (contact.contacts.find((obj) => obj._id.equals(user._id))) {
                await contact.contacts.splice(await contact.contacts.indexOf(await contact.contacts.find((obj) => obj._id.equals(user._id))), 1);
                await contact.contacts.unshift({ _id: user._id });
            }
            else {
                await contact.contacts.unshift({ _id: user._id });
            }
            await user.save()
            await contact.save()
            return res.json({ success: true, contacts: user.contacts });
        }
        else {
            return res.json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}


const createChat = async (req, res) => {
    try {
        if (req.body.user) {
            const user = req.body.user;
            const contact = await User.findOne({ _id: req.body._id });
            if (!contact) {
                return res.status(400).json({ success: false, error: 'Invalid request!' })
            }
            if (await Chat.findOne({ members: { $all: [user._id, contact._id] } })) {
                return res.status(400).json({ success: false, error: 'Invalid request!' })
            }
            const chat = Chat({
                members: [user._id, contact._id],
                messages: [{
                    _id: new mongoose.Types.ObjectId(),
                    message: req.body.message,
                    sender: user._id,
                    timeStamp: new Date()
                }]
            })
            if (contact.unreadMessages[user._id]) {
                contact.unreadMessages[user._id] += 1;
            }
            else {
                contact.unreadMessages[user._id] = 1;
            }
            contact.markModified('unreadMessages');
            await contact.save();
            await chat.save();
            return res.json({ success: true, messages: chat.messages });
        }
        else {
            return res.json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

const addMessage = async (req, res) => {
    try {
        if (req.body.user) {
            const user = req.body.user;
            const contact = await User.findOne({ _id: req.body._id });
            if (!contact) {
                return res.status(400).json({ success: false, error: 'Invalid request.' })
            }
            const chat = await Chat.findOne({ members: { $all: [user._id, contact._id] } })
            if (!chat) {
                return res.status(400).json({ success: false, error: 'Invalid request.' })
            }
            chat.messages.push({
                _id: new mongoose.Types.ObjectId(),
                message: req.body.message,
                sender: user._id,
                timeStamp: new Date()
            })
            if (contact.unreadMessages[user._id]) {
                contact.unreadMessages[user._id] += 1;
            }
            else {
                contact.unreadMessages[user._id] = 1;
            }
            contact.markModified('unreadMessages');
            await contact.save();
            await chat.save();
            return res.json({ success: true, messages: chat.messages });
        }
        else {
            return res.json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

module.exports = { getContacts, getMessages, addContact, createChat, addMessage }