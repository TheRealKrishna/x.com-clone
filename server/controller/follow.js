const User = require("../database/models/UserSchema.js")
const errorHandler = require("../handler/errorHandler.js")


const getFollowers = async (req, res) => {
    try {
        if (req.body.user) {
            const UserId = req.body._id
            const user = await User.findOne({ _id: UserId }).populate('followers', '-password -__v')
            if(!user){
                return res.json({ success: false, error: "Invalid Request" })
            }
            return res.json({ success: true, followers: user.followers })
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

const getFollownig = async (req, res) => {
    try {
        if (req.body.user) {
            const UserId = req.body._id
            const user = await User.findOne({ _id: UserId }).populate('following', '-password -__v')
            if(!user){
                return res.json({ success: false, error: "Invalid Request" })
            }
            return res.json({ success: true, following: user.following })
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


const addFollower = async (req, res) => {
    try {
        if (req.body.user) {
            const user = await User.findOne({ _id: req.body._id }, ["-password", "-__v"])
            if (user) {
                if (!user.followers.includes(req.body.user._id)) {
                    await user.followers.push(req.body.user._id)
                }
                if (!req.body.user.following.includes(user._id)) {
                    await req.body.user.following.push(user._id);
                }
                await user.save()
                await req.body.user.save()
                return res.json({ success: true })
            }
            else {
                return res.json({ success: false, error: "Invalid Request" })
            }
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

const removeFollower = async (req, res) => {
    try {
        if (req.body.user) {
            const user = await User.findOne({ _id: req.body._id }, ["-password", "-__v"])
            if (user) {
                if (user.followers.includes(req.body.user._id)) {
                    await user.followers.splice(user.followers.indexOf(req.body.user._id), 1);
                }
                if (req.body.user.following.includes(user._id)) {
                    await req.body.user.following.splice(req.body.user.following.indexOf(user._id), 1);
                }
                await user.save()
                await req.body.user.save()
                return res.json({ success: true })
            }
            else {
                return res.json({ success: false, error: "Invalid Request" })
            }
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


module.exports = { addFollower, removeFollower, getFollowers, getFollownig }