const mongoose = require('mongoose');
const topicmanagerSchema = new mongoose.Schema({
    email: {type:String, required:true},
    topic: {type:mongoose.Types.ObjectId,ref:'topics'},
    password: {type:String, required: true}
})

module.exports = mongoose.model('Topicmanager', topicmanagerSchema);