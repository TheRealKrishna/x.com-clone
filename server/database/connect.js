const Mongoose = require("mongoose")
const dotenv = require('dotenv');
dotenv.config({ path: './.env.local' });
const errorHandler = require("../handler/errorHandler")

function mongoConnect(){
    Mongoose.connect(process.env.MONGO_URI).then((result) => {
        console.log("MongoDB Connected to: x.com")  
    }).catch((err) => {
        console.log(err)
        errorHandler(err)
        mongoConnect()
    });
}

module.exports=mongoConnect