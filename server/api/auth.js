const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser");
const { handleValidation } = require("../utils/helpers");
const ctrl = require("../controller/auth");

router.post("/emailvalidate", ctrl.emailValidators, handleValidation, ctrl.emailValidate);
router.post("/phonevalidate", ctrl.phoneValidators, handleValidation, ctrl.phoneValidate);
router.post("/signupwithemail", ctrl.signupEmailValidators, handleValidation, ctrl.signUpWithEmail);
router.post("/signupwithphone", ctrl.signupPhoneValidators, handleValidation, ctrl.signUpWithPhone);
router.post("/loginvalidate", ctrl.loginValidate);
router.post("/login", ctrl.loginValidators, handleValidation, ctrl.login);
router.post("/loginwithgoogle", ctrl.loginWithGoogle);

router.post("/editprofile", getUser, ctrl.editProfile);
router.post("/getuserinfo", getUser, ctrl.getUserInfo);
router.post("/getuserinfowithid", getUser, ctrl.getUserInfoWithId);
router.post("/getuserinfowithusername", getUser, ctrl.getUserInfoWithUsername);

module.exports = router;
