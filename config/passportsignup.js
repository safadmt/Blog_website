const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user');
const bcrypt = require('bcryptjs');


module.exports = (passport)=> {
    passport.use('local-signup',
    new LocalStrategy({usernameField: 'email', passReqToCallback: true},
    (req, email,password, done)=> {
        console.log(req.body)
        User.findOne({email : email}, (err,user)=> {
            if(err) throw err
            if(user) {
                return done(null, false, {message: 'Email already in use'})
            }else{
                let hashpassword = bcrypt.hashSync(password,8)
                let newuser = new User({
                    email:email,
                    password: hashpassword,
                    name: req.body.name,
                    approved: "Approved",
                    user_status: "Basic"
                }).save((err,user)=> {
                    if(err) throw err
                    return done(null, user)
                })
            }
        })
        
    }))

    passport.serializeUser((user, done)=> {
        done(null, user.id)
    })

    passport.deserializeUser((id, done)=> {
        User.findById(id, (err,user)=> {
            done(err, user)
        })
    })
}