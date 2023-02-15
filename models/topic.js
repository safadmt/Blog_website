const mongoose = require('mongoose');
const topicSchema = new mongoose.Schema({
    topic: {type:String, required: true},
    date: {type:Date, default: Date.now()}
});

module.exports = mongoose.model('Topics', topicSchema)