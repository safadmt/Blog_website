
const Article = require('../models/article');
const topic = require('../models/topic');
const ObjectId = require('mongoose').Types.ObjectId
const User = require('../models/user'); 

module.exports = {
    getArticleforadmin: async()=> {
        try{
            let articles = await Article.find().sort({ _id: -1 }).lean();

            return articles
        }catch (err) {
            console.log(err);
            return []
        }
    },
    getArticles: async () => {
        try {
            let articles = await Article.find({approved: "2"}).sort({ _id: -1 }).lean();

            return articles
        }catch (err) {
            console.log(err);
            return []
        }

    },
    getfindByTopic: async(topics)=> {
        try{
            let article= await Article.find({topic: topics}).sort({_id: -1}).lean();
            return article
        }catch(err) {
            console.log(err)
        }
    },
    getfindByTopicToUser: async(topics)=> {
        try{
            let article= await Article.find({$and: [{topic: topics},{approved: "2"}]}).sort({_id: -1}).lean();
            return article
        }catch(err) {
            console.log(err)
        }
    },

    updateApprove: (data) => {
        return new Promise((resolve, reject) => {
            let status = ""
            Article.findOne({ _id: data.id }).then(blog => {
                if (data.value === "0") {
                    Article.updateOne({ _id: ObjectId(data.id) }, {
                        $set: {
                            approved: "0"
                        }
                    })
                        .then(response => {
                            status = "0"
                            resolve(status)
                        })
                        .catch(err => {
                            console.log(err)
                        })
                } else if (data.value === "1") {
                    Article.updateOne({ _id: ObjectId(data.id) }, {
                        $set: { approved: "1" }
                    })
                        .then(response => {
                            status = "1"
                            resolve(status)
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }else if (data.value === "2") {
                    Article.updateOne({ _id: ObjectId(data.id) }, {
                        $set: { approved: "2" }
                    })
                        .then(response => {
                            status = "2"
                            resolve(status)
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }
            })

        })
    },

    getOneBlog: async(id) => {
        try{
            let article = await Article.findOne({_id: id}).lean()
            return article
        }catch(err) {
            console.log(err)
        }
    },

    updateOne: (id,data) => {
        return new Promise((resolve, reject)=> {
            Article.updateOne({_id: ObjectId(id)}, {
                $set: {
                    topic: data.topics,
                    description: data.description,
                    article: data.article
                }
            })
            .then(user=> {
                resolve(user)
            })
            .catch(err=> {
                reject(err)
            })
        })
    },

    postComment: (proid, user, comment, callback) => {
        try {
            let obj = {
                userid: user._id,
                email: user.email,
                comment: comment.comment
            }
            Article.updateOne({ _id: proid }, {
                $push: { comments: obj }
            }).then(response => {
                return callback(response)
            }).catch(err => {
                console.log(err)
            })
        } catch (err) {
            console.log(err)
        }
    },
    postrating: (proid, user, rating) => {
        let obj = {
                userid: user._id,
                rating: rating
            }
        return new Promise((resolve, reject) => {
            Article.updateOne({ _id: proid }, {
                $push: { rating: obj }
            }).then(response => {
                return resolve(response)
            }).catch(err => {
                console.log(err)
            })
        })
    },


    getAvaragerating: (userid)=> {
        return new Promise((resolve, reject) => {
            Article.aggregate([
            {
                $match: {userid: ObjectId(userid)}
            },
            {
                $unwind: "$rating"
            },
            {
                $group: {
                    _id: null,
                    averagerating: {$avg: "$rating.rating"}
                }
            }
            ]).then(response=> {
                let rating = response[0].averagerating.toFixed(1)
                resolve(rating)
            }).catch(err=> {
                reject(err)
                console.log(err)
                
            })
        })
        
    },
    

    getUserArticle: async(userid)=> {
        try{
            let response = await Article.find({userid: userid}).sort({_id: -1}).lean();
            return response
        }catch(err) {
            console.log(err)
        }
    },
    removeOneArticle: (proid,callback)=> {
        try{
            Article.deleteOne({_id: proid}).then(response=> {
                return callback(response)
            })
            .catch(err=> {
                console.log(err)
            })
        }catch(err){
            console.log(err)
        }
    }

}



