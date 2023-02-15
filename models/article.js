const mongoose = require('mongoose');
const articleSchema = new mongoose.Schema({
    userid: {type: mongoose.Types.ObjectId},
    topic : {type:mongoose.Types.ObjectId, required:true},
    description : {type:String, required:true},
    approved : {type:String, required:true},
    article : {type:String, required:true},
    date: {type: Date,default: Date.now()},
    rating: [{rating:{type:Number},userid:{type:mongoose.Types.ObjectId}}],
    comments: [{userid: {type:mongoose.Types.ObjectId},email:{type:String},comment:{type:String}}]
})

module.exports = mongoose.model('Article', articleSchema);