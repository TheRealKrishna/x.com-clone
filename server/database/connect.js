const Mongoose = require("mongoose")
const dotenv = require('dotenv');
dotenv.config({ path: './.env.local' });

function mongoConnect(){
    Mongoose.connect(process.env.MONGO_URI).then((result) => {
        console.log("MongoDB Connected to: x.com")  
    }).catch((err) => {
        console.log(err)
    });
}

module.exports=mongoConnect