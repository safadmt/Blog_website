const express = require('express');
const router = express.Router();
const passport = require('passport');
const { ensureAuth } = require('../auth/auth');
const userControllers = require('../controllers/userControllers');
const blogController = require('../controllers/blogController');
const topicController = require('../controllers/topicController');

router.get('/signup', (req, res)=> {
    res.render('user/signup')
});

router.get('/login', (req, res)=> {
    res.render('user/login')
});

router.post('/signup', (req, res, next)=> {
    console.log(req.body)
    let errors = [];
    const {name, email, password, confirmpassword} = req.body;
    if(!name || !email || !password || !confirmpassword) {
        errors.push({error: 'Please fill up all the field'})
    }else if(password !== confirmpassword) {
        errors.push({error: 'Password do not match'});
    }else if(password.length < 4) {
        errors.push({error: 'Password minimum 4 charactors long'})
    }

    if(errors.length > 0) {
        const user = {name, email, password ,confirmpassword}
        res.render('user/signup', {errors, user})
    }else{
        passport.authenticate('local-signup', {successRedirect: '/users/profile',
        failureRedirect: '/users/signup',
        failureFlash: true,
        failureMessage: true
    })(req, res, next);
    }
})

router.post('/login', (req, res, next)=> {
    passport.authenticate('local', {successRedirect: '/users/profile',
    failureRedirect: '/users/login',
    failureMessage: true,
    failureFlash: true
})(req,res,next);
});


router.get('/profile', ensureAuth, async (req, res) => {
    req.session.user = req.user;
    const user = {
        id: req.session.user._id,
        email: req.session.user.email,
        name: req.session.user.name,
        status : req.session.user.user_status,
        rating: req.session.user.rating
    }
    let topics = await topicController.getTopics();
    let articles = await blogController.getUserArticle(req.session.user._id);
    for(let i= 0; i < articles.length; i++) {
        let topic = await topicController.getOne(articles[i].topic);
        articles[i].topicdetails = {...topic};
    }
    res.render('profile', { user,topics, articles })

});
router.get('/blogs/:id', ensureAuth,async(req, res)=>{
    const user = {email:req.session.user.email}
    let blog = await blogController.getOneBlog(req.params.id);
    let topic = await topicController.getOne(blog.topic);
    blog.topicdetails = {...topic}
    res.render('user/viewblog', { blog, user})
    
});
router.post('/updateOneUser/:id', (req, res)=> {
    userControllers.updateOneUser(req.params.id,req.body,response=> {
        res.json(response)
    })
});

router.get('/editeuserArticle/:id', ensureAuth, async(req, res) => {
    const user = {email:req.session.user.email}
    let topics = await topicController.getTopics()
    let blog = await blogController.getOneBlog(req.params.id);
    let topic = await topicController.getOne(blog.topic)
    blog.topicdetails = {...topic}
    res.render('edit_user_article', { blog,topics , user})
    
});


router.post('/editeuserArticle/:id',ensureAuth, (req,res) => {
    
    
    const {topics, description, article} = req.body;
    if(!topics || !description || !article) {
        req.flash('error_msg', 'Required all field');
        res.redirect('/edituserArticle/'+ req.params.id)
    }else{
        blogController.updateOne(req.params.id,req.body).then(response=> {
            req.flash('success_msg', 'Updated successfully')
            res.redirect('/users/profile')
        })
    }
})

router.get('/deleteuserArticle/:id',ensureAuth, (req, res) => {
    console.log('hello wordl')
    blogController.removeOneArticle(req.params.id, (response) => {
        req.flash('success_msg', 'Removed successfully')
        res.redirect('/users/profile')
    })
});

router.get('/change_password',ensureAuth, (req, res)=> {
    const user = {email:req.session.user.email}
    res.render('user/change-password', {user})
});

router.post('/change_password', ensureAuth, (req, res)=> {
    const {current_password, new_password, confirm_new_password} = req.body;
    if(!current_password || !new_password || !confirm_new_password) {
        req.flash('error_msg', 'Please fill up all the field')
        res.redirect('/users/change_password')
    }else if(new_password !== confirm_new_password) {
        req.flash('error_msg', 'Confirm new Password do not match the new Password');
        res.redirect('/users/change_password')
    }else{
        let id = req.session.user._id
        userControllers.changeUserPassword(id,current_password, new_password, (err, response)=> {
            if(err) {
                req.flash('error_msg',err)
                res.redirect('/users/change_password')
            }else{
                req.flash('success_msg', 'Password changed successfully,please login');
                res.redirect('/users/login')
            }
            
        })
        
    }
})
router.get('/delete-user/:id', (req, res)=> {
    
    userControllers.deleteOneUser(req.params.id, respone=> {
        
        req.session.destroy();
        
        res.redirect('/');
    });
})

module.exports = router;