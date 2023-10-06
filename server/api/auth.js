const express = require('express')
const app = express()
const {body} = require('express-validator');
const {emailValidate, phoneValidate, signUpWithEmail, signUpWithPhone, loginValidate, login, loginWithGoogle, getUserInfo} = require("../controller/auth.js")
const getUser = require("../middleware/getUser.js")


app.post("/emailvalidate", body('email').isEmail(), emailValidate)

app.post("/phonevalidate", body('phone').isLength({ min: 1 }), phoneValidate)


app.post("/signupwithemail", body('email').isEmail(), body('password').isLength({ min: 8 }), body('name').isLength({ min: 1 }), signUpWithEmail)

app.post("/signupwithphone", body("phone").isLength({ min: 1 }), body('password').isLength({ min: 8 }), body('name').isLength({ min: 1 }), signUpWithPhone)

app.post("/loginvalidate", loginValidate)

app.post("/login", body('password').isLength({ min: 8 }), login)

app.post("/loginwithgoogle", loginWithGoogle);

app.post("/getuserinfo", getUser , getUserInfo)

module.exports = app