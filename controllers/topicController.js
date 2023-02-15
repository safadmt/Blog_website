const Topic = require('../models/topic');
const ObjectId = require('mongoose').Types.ObjectId;
module.exports = {
    addTopic: (data, callback) => {
        try {
            Topic.findOne({ topic: data.topic })
                .then(topic => {
                    if (!topic) {
                        let newtopic = new Topic({
                            topic: data.topic
                        }).save()
                            .then(response => {
                                console.log(response);
                                callback(response)
                            })
                            .catch(err => {
                                console.log(err)
                            })
                    }
                })
        } catch (err) {
            console.log(err)
        }
    },

    getTopics: async () => {
        try {
            let topics = await Topic.find().sort({ _id: -1 }).lean();
            return topics
        } catch (err) {
            console.log(err)
        }
    },

    getOne: async(id) => {
        return new Promise((resolve, reject)=> {
            Topic.findOne({_id: id}).lean()
            .then(topic=> {
                resolve(topic)
            })
            .catch(err=> {
                console.log(err)
            })
            
        })
    },

    updateOne: (id, data, callback) => {
        try {

            Topic.updateOne({ _id: ObjectId(id) }, {
                $set: { topic: data.topic }
            })
            .then(response => {
                console.log(response)
                return callback(response)
            })
            .catch(err => {
                console.log(err)
            })

        } catch (err) {
            console.log(err)
        }
    },

    deleteOne: (id, callback)=> {
        try{
            Topic.deleteOne({_id: id})
            .then(topic=> {
                console.log(topic)
                return callback(topic)
            })
            .catch(err=> {
                console.log(err)
            })
        }catch(err) {
            console.log(err)
        }
    }
}