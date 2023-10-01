const express = require('express')
const app = express()
const { body, validationResult } = require('express-validator')
const User = require("../database/models/UserSchema.js")
const errorHandler = require("../handler/errorHandler.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { default: phone } = require('phone')
const Joi = require("@hapi/joi");
const customJoi = Joi.extend(require("joi-age"));
const ageSchema = customJoi.date().minAge(13);
const { generateFromEmail } = require("unique-username-generator");

// check if username, email/phone and dob is correct

app.post("/emailvalidate", body('email').isEmail(), async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ success: false, error: 'Invalid email address!' })
        }
        const emailCheck = await User.findOne({ email: req.body.email })
        if (emailCheck) {
            return res.status(400).json({ success: false, error: 'Email already exists!' })
        }
        return res.json({ success: true })
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
})

app.post("/phonevalidate", body('phone').isLength({ min: 1 }), async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty() && errors.errors[0].path === 'phone') {
            return res.status(400).json({ success: false, error: 'Phone number is required!' })
        }
        if (!(phone(req.body.phone, { country: req.body.country }).isValid)) {
            return res.status(400).json({ success: false, error: 'Invalid phone number!' })
        }
        const phoneCheck = await User.findOne({ phone: phone(req.body.phone, { country: req.body.country }).phoneNumber })
        if (phoneCheck) {
            return res.status(400).json({ success: false, error: 'Phone number already exists!' })
        }
        return res.json({ success: true })
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
})


app.post("/signupwithemail", body('email').isEmail(), body('password').isLength({ min: 8 }), body('name').isLength({ min: 1 }), async (req, res) => {
    try {
        // basic checks
        const errors = validationResult(req)
        if (!errors.isEmpty() && errors.errors[0].path === 'name') {
            return res.status(400).json({ success: false, error: 'Name is required!' })
        }
        if (!errors.isEmpty() && errors.errors[0].path === 'email') {
            return res.status(400).json({ success: false, error: 'Invalid email address. Please try again.' })
        }
        if (!errors.isEmpty() && errors.errors[0].path === 'password') {
            return res.status(400).json({ success: false, error: 'Password must be atleast 8 characters long.' })
        }
        if (ageSchema.validate(`${new Date(req.body.dob).getFullYear()}-${new Date(req.body.dob).getMonth()}-${new Date(req.body.dob).getDate()}`).error) {
            return res.status(400).json({ success: false, error: 'You must be atleast 13 years old!' })
        }
        const emailCheck = await User.findOne({ email: req.body.email });
        if (emailCheck) {
            return res.status(400).json({ success: false, error: 'An account already exists with that email.' })
        }

        //password hash
        const securePassword = bcrypt.hashSync(req.body.password, 10);

        //username generate
        const uniqueUsernameGenerator = async () => {
            const name = req.body.name.split(" ").join("").slice(0, 12);
            while (1) {
                const newUsername = generateFromEmail(name, 3)
                const usernameCheck = await User.findOne({ username: newUsername });
                if (!usernameCheck) {
                    return newUsername;
                }
            }
        }

        //user creation
        const user = await User.create({ ...req.body, password: securePassword, username: await uniqueUsernameGenerator() });
        await user.save();

        //token creation
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        //success response
        return res.json({ success: true, authToken: token })
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured." })
    }

})

app.post("/signupwithphone", body("phone").isLength({ min: 1 }), body('password').isLength({ min: 8 }), body('name').isLength({ min: 1 }), async (req, res) => {
    try {
        // basic checks
        const errors = validationResult(req)
        if (!errors.isEmpty() && errors.errors[0].path === 'name') {
            return res.status(400).json({ success: false, error: 'Name is required!' })
        }
        if (!errors.isEmpty() && errors.errors[0].path === 'phone') {
            return res.status(400).json({ success: false, error: 'phone number is required' })
        }
        if (!errors.isEmpty() && errors.errors[0].path === 'password') {
            return res.status(400).json({ success: false, error: 'Password must be atleast 8 characters long.' })
        }
        if (ageSchema.validate(`${new Date(req.body.dob).getFullYear()}-${new Date(req.body.dob).getMonth()}-${new Date(req.body.dob).getDate()}`).error) {
            return res.status(400).json({ success: false, error: 'You must be atleast 13 years old!' })
        }
        if (!(phone(String(req.body.phone), { country: req.body.country }).isValid)) {
            return res.status(400).json({ success: false, error: 'Invalid phone number!' })
        }

        const phoneCheck = await User.findOne({ phone: phone(req.body.phone, { country: req.body.country }).phoneNumber });
        if (phoneCheck) {
            return res.status(400).json({ success: false, error: 'An account already exists with that phone number.' })
        }

        //password hash
        const securePassword = bcrypt.hashSync(req.body.password, 10);

        //username generate
        const uniqueUsernameGenerator = async () => {
            const name = req.body.name.split(" ").join("").slice(0, 12);
            while (1) {
                const newUsername = generateFromEmail(name, 3)
                const usernameCheck = await User.findOne({ username: newUsername });
                if (!usernameCheck) {
                    return newUsername;
                }
            }
        }

        //user creation
        const user = await User.create({ ...req.body, password: securePassword, phone: phone(String(req.body.phone), { country: req.body.country }).phoneNumber, username: await uniqueUsernameGenerator() });
        await user.save();

        //token creation
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

        //success response
        return res.json({ success: true, authToken: token })
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured." })
    }

})

app.post("/loginvalidate", async (req, res) => {
    try {
        let user = undefined;
        let method = undefined;
        const usernameCheck = await User.findOne({ username: req.body.name })
        user = usernameCheck;
        method = "Username";
        if (!usernameCheck) {
            const emailCheck = await User.findOne({ email: req.body.name })
            user = emailCheck;
            method = "Email";
            if (!emailCheck) {
                const phoneCheck = await User.findOne({ phone: phone(String(req.body.name), { country: req.body.country }).phoneNumber })
                user = phoneCheck;
                method = "Phone";
                if (!phoneCheck) {
                    return res.status(400).json({ success: false, error: 'Sorry, we could not find your account.' })
                }
            }
        }
        if(!user.password){
            return res.status(400).json({ success: false, error: 'Please use Google or Apple login for this account.'})
        }
        // const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        return res.json({ success: true, method: method })
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
})

app.post("/login", body('password').isLength({ min: 8 }), async (req, res) => {
    try {
        let user = undefined;
        const usernameCheck = await User.findOne({ username: req.body.name })
        user = usernameCheck;
        if (!usernameCheck) {
            const emailCheck = await User.findOne({ email: req.body.name })
            user = emailCheck;
            if (!emailCheck) {
                const phoneCheck = await User.findOne({ phone: phone(String(req.body.name), { country: req.body.country }).phoneNumber })
                user = phoneCheck;
                if (!phoneCheck) {
                    return res.status(400).json({ success: false, error: 'Sorry, we could not find your account.' })
                }
            }
        }
        if(!user.password){
            return res.status(400).json({ success: false, authError:true, error: 'Oops! looks like You signed up using Google or Apple. Please log in with them.'})
        }
        if (!(bcrypt.compareSync(req.body.password, user.password))) {
            return res.status(400).json({ success: false, error: 'Wrong password!' })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        return res.json({ success: true, authToken: token })
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
})


app.post("/loginwithgoogle", async (req, res) => {
    try {
        const response = await fetch(`https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos,birthdays`, {
            headers: {
                "Authorization": `Bearer ${req.body.access_token}`
            }
        })
        const json = await response.json();
        const user = await User.findOne({ email: json.emailAddresses[0].value });
        if (!user) {
            const uniqueUsernameGenerator = async () => {
                const name = json.names[0].givenName.split(" ").join("").slice(0, 12);
                while (1) {
                    const newUsername = generateFromEmail(name, 3)
                    const usernameCheck = await User.findOne({ username: newUsername });
                    if (!usernameCheck) {
                        return newUsername;
                    }
                }
            }
            const user = await User.create({name:json.names[0].givenName, email:json.emailAddresses[0].value, dob:new Date(`${json.birthdays[0].date.year}-${json.birthdays[0].date.month}-${json.birthdays[0].date.day}`), profile:json.photos[0].url, username: await uniqueUsernameGenerator() });
            await user.save();
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
            return res.json({ success: true, authToken: token })
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        return res.json({ success: true, authToken: token })
    }
    catch (error) {
        errorHandler(error)
        return res.status(500).json({ success: false, error: "An internal server error occured!" })
    }
})

module.exports = app