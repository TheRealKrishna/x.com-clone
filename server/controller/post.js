const { validationResult } = require('express-validator')
const User = require("../database/models/UserSchema.js")
const Post = require("../database/models/PostSchema.js")
const errorHandler = require("../handler/errorHandler.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Joi = require("@hapi/joi");
const customJoi = Joi.extend(require("joi-age"));

const getPosts = async (req, res) => {
    try {
        if (req.body) {
            const posts = await Post.find({}).populate('sender', '-password -__v').sort({_id:-1})
            return res.json({ success: true, posts });
        } else {
            return res.status(400).json({ success: false, error: "Invalid Request!" });
        }
    } catch (error) {
        errorHandler(error);
        return res.status(500).json({ success: false, error: "An internal server error occurred!" });
    }
}

const addPost = async (req, res) => {
    try {
        if (req.body.user) {
            if (req.body.images.length === 0 && req.body.message.length === 0) {
                return res.status(400).json({ success: false, error: "A message or image is required!" })
            }
            const post = await new Post({ ...req.body, sender: req.body.user._id, timestamp:new Date(), message:req.body.message.trim()})
            await post.save()
            return res.json({ success: true, post: post })
        }
        else {
            return res.status(400).json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

const addView = async (req, res) => {
    try {
        if (req.body.user) {
            const post = await Post.findOne({_id:req.body._id})
            if (!post.views.includes(req.body.user._id)) {
                await post.views.push(req.body.user._id)
            }
            await post.save()
            return res.json({ success: true })
        }
        else {
            return res.status(400).json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

const addLike = async (req, res) => {
    try {
        if (req.body.user) {
            const post = await Post.findOne({_id:req.body._id})
            if (!post.likes.includes(req.body.user._id)) {
                await post.likes.push(req.body.user._id)
            }
            await post.save()
            return res.json({ success: true })
        }
        else {
            return res.status(400).json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

const removeLike = async (req, res) => {
    try {
        if (req.body.user) {
            const post = await Post.findOne({_id:req.body._id})
            if (post.likes.includes(req.body.user._id)) {
                await post.likes.splice(post.likes.indexOf(req.body.user._id), 1);
            }
            await post.save()
            return res.json({ success: true })
        }
        else {
            return res.status(400).json({ success: false, error: "Invalid Request!" })
        }
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
}

module.exports = { getPosts, addPost, addView, addLike, removeLike }