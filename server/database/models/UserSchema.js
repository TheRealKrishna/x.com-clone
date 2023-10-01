const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required:true,
  },
  email: {
    type: String,
    unique:()=>{
      return this.email && this.email.length > 0
    },
    required:()=>{
      return this.phone && this.phone.length < 0
    },
    default:""
  },
  phone:{
    type: String,
    unique:()=>{
      return this.phone && this.phone.length > 0
    },
    required:()=>{
      return this.email && this.email.length < 0
    },
    default:""
  },
  password: {
    type: String,
  },
  dob: {
    type: Date,
    required:true
  },
  profile: {
    type: String,
    default: ""
  },

},{ minimize: false });

const User = new mongoose.model("User", UserSchema);
module.exports = User