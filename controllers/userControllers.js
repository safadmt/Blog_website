const User = require('../models/user');
const ObjectId = require('mongoose').Types.ObjectId;
const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const Article = require('../models/article');

module.exports = {
    getAllUser: async()=> {
        try{
            let user = await User.find().lean();
            return user
        }catch(err){
            console.log(err)
        }
    },
    getOneUser: async(id)=> {
        try{
            let user = await User.findOne({_id: id}).lean();
            return user;
        }catch(err){
            console.log(err)
        }
        
    },
    updateOneUser: (userid, data, cb)=> {
        try{
            let status = "";
            User.findOne({_id: userid}).then(user=> {
                if(user) {
                    if(data.value === "1" && user.approved === "Rejected") {
                        User.updateOne({_id: ObjectId(userid)}, {
                            $set: {approved: "Approved"}
                        })
                        .then(response=> {
                            status = "1"
                            return cb(status)
                        })
                        .catch(err=>{
                            console.log(err)
                        })
                    }else if(data.value === "0" && user.approved === "Approved"){
                        User.updateOne({_id: ObjectId(userid)}, {
                            $set: {approved: "Rejected"}
                        })
                        .then(response=> {
                            status = "0"
                            return cb(status)
                        })
                        .catch(err=>{
                            console.log(err)
                        })
                    }
                }else{
                    return cb([])
                }
            })
        }catch(err){
            console.log(err)
        }
    },

    deleteOneUser: (id, callback)=> {
        try{
            User.deleteOne({_id: id}).then(user=> {
                Article.deleteMany({userid: ObjectId(id)}).then(response=> {
                    return callback(response)
                }).catch(err=> {
                    console.log(err)
                })
            }).catch(err=> {
                console.log(err)
            })
        }catch(err) {
            console.log(err)
        }
    },

    updateUserRating: (rating,userid)=> {
        return new Promise((resolve, reject) => {
            console.log("rating:" + rating)
            if(rating >= 3.5) {
                User.updateOne({_id: userid}, {
                    $set: {
                        rating: rating,
                        user_status: "Premium"
                    }

                })
                .then(response=> {
                    console.log(response)
                    resolve(response)
                })
                .catch(err=> {
                    console.log(err)
                })
            }else if(rating <= 3.5){
                User.updateOne({_id: userid}, {
                    $set: {
                        rating: rating,
                        user_status: "Basic"
                    }

                })
                .then(response=> {
                    console.log("newrating;" + response)
                    resolve(response)
                })
                .catch(err=> {
                    console.log(err)
                })
            }
            
        })
    },

    changeUserPassword: (id, oldPassword, newpassword,callback)=> {
        User.findOne({_id: id}, (err, user)=> {
            if(err) throw err
            if(user) {
                bcrypt.compare(oldPassword, user.password, (err,isMatch)=> {
                    if(err) throw err;
                    if(!isMatch) {

               
                    let error = 'Current passworod do not match'
                    return callback(error,null)
                    }else{
                bcrypt.hash(newpassword, 8, (err,password)=> {
                    if(err) throw err
                    User.updateOne({_id: ObjectId(id)}, {
                        $set: {password: password}
                    }).then(response=> {
                        return callback(null,response)
                    })
                })
                    }
                });
                
            }else{
                return callback(null, [])
            }
        })
    }
}









