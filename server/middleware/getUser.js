const jwt = require("jsonwebtoken");
const User = require("../database/models/UserSchema");

const getUser = async (req, res, next)=>{
    const {authtoken} = req.headers;
    const userId = jwt.verify(authtoken, process.env.JWT_SECRET);
    const user = await User.findOne({_id:userId._id},["-password", "-__v"]);
    if(user){
        req.body.user = user;
    }
    next();
}

module.exports = getUser;