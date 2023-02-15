const Topicmanager = require('../models/topicmanger');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');
const Topic = require('../models/topic');
module.exports = {
    getTopicManagers: async()=> {
        try{
        
            let data = await Topicmanager.find().sort({_id: -1}).lean();
            return data;
            
        }catch(err) {
            console.log(err)
            return []
        }
    },
    addTopicManager: async(data , callback)=> {
        try{
            let password =await bcrypt.hash(data.password, 8)
                    
                    let newtopicmanager = new Topicmanager({
                        topic: ObjectId(data.topics),
                        email: data.email,
                        password: password
                    }).save()
                    .then(response=> {
                        console.log(response)
                        return callback(response)
                    })
                    .catch(err=> {
                        console.log(err)
                    })
            
        }catch(err) {
            console.log(err)
        }
    },
    getOneTopicManager: (id)=> {
        return new Promise((resolve, reject)=> {
            Topicmanager.findOne({_id: id}).lean().then(topic=> {
                resolve(topic)
            }).catch(err=> {
                reject(err)
            })
        })
    },

    updateOneTopicManager: async(id, data, callback)=> {
        try{
            let password =await bcrypt.hash(data.password, 8);
            Topicmanager.updateOne({_id: ObjectId(id)}, {
                $set: {
                    topic: data.topics,
                    email: data.email,
                    password: password
                }
            })
            .then(response=> {
                return callback(response)
            })
            .catch(err=> {
                console.log(err)
            })
        }catch(err){
            console.log(err)
        }
    },

    delete_topic_manager: (id,callback)=> {
        try{
            Topicmanager.deleteOne({_id: id}).then(response=> {
                console.log(response)
                return callback(response)
            }).catch(err=> {
                console.log(err)
            })
        }catch(err) {
            console.log(err)
        }
    }
}