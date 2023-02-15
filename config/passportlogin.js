const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user');
const bcrypt = require('bcryptjs');



module.exports = (passport)=> {
    passport.use(new LocalStrategy(
        {usernameField: 'email'}, (email,password, done)=> {
            User.findOne({email: email})   
            .then(user=> {
                if(!user) {
                    return done(null, false, {message: 'Email not registered'})
                }
                if(user.approved === "Approved") {
                    bcrypt.compare(password, user.password, (err,isMatch)=> {
                    if(err) throw err
                    
                    if(isMatch) {
                        return done(null, user)
                    }else{
                        return done(null, false, {message: 'Password do not match'})
                    }
                    })
                }else{
                    return done(null, false, {message: 'Login blocked by Admin Panel'})
                }
                
            })
            .catch(err=> {throw err})
        })
    )

    passport.serializeUser((user, done)=> {
        done(null, user.id)
    });

    passport.deserializeUser((id, done)=> {
        User.findById(id, (err, user)=> {
            done(err, user)
        })
    })
};
