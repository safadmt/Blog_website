const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true},
    password: {type:String, required:true},
    approved: {type:String},
    rating: {type:String,default:0},
    user_status: {type:String},
    date: {type: Date, default: Date.now()}

});

module.exports = mongoose.model('Users', userSchema);