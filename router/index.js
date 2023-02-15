const express = require('express');
const router = express.Router();
const ensureAuth = require('../auth/auth').ensureAuth;
const Article = require('../models/article');
const ObjectId = require('mongoose').Types.ObjectId;
const blogController = require('../controllers/blogController');
const User = require('../models/user');
const topicController = require('../controllers/topicController');
const userControllers = require('../controllers/userControllers');


router.get('/', async (req, res) => {
    let topics = await topicController.getTopics();
    let article = await blogController.getArticles();
    for(let i = 0; i < article.length; i++) {
            let topic = await topicController.getOne(article[i].topic);
            let author = await userControllers.getOneUser(article[i].userid);
            article[i].topicdetails = {...topic}
            article[i].userdetails = {...author}
        }
    if (req.session.user) {
        let user = {email:req.session.user.email};

        res.render('home', { article, user,topics })
    } else if(req.session.admin){
        let admin = req.session.admin.email;

        res.render('home', { article, admin ,topics})
    } else if(req.session.topicmanager){
        let topicmgr = req.session.topicmanager.email;

        res.render('home', { article, topicmgr,topics })
    }else {
        
        res.render('home', { article,topics})
    }

});





router.get('/formarticle', ensureAuth, async(req, res) => {
    const user= {email: req.session.user.email}
    let topics = await topicController.getTopics()
    res.render('form_article', { user,topics})
})

router.post('/formarticle', ensureAuth, async(req, res) => {
    let user = req.session.user
    
   
    const { topics, description, article } = req.body;
    if (!topics || !description || !article) {
        let topics = await topicController.getTopics();
        return res.render('form_article', { error: 'Please fill up all the field' ,user,topics ,data:req.body})
    }

    let newarticle = new Article({
        userid: ObjectId(user._id),
        topic: topics,
        description: description,
        approved: "1",
        article: article
    }).save()
        .then(response => {
            req.flash('success_msg', 'Article submitted successfully')
            res.redirect('/users/profile')
        })
        .catch(err => {
            console.log(err)
        })
});

router.get('/blogs/:id', async(req, res) => {
    let blog = await blogController.getOneBlog(req.params.id)
    let topic = await topicController.getOne(blog.topic);
    let author = await userControllers.getOneUser(blog.userid);
    blog.topicdetails = {...topic}
    blog.userdetails = {...author}
    console.log(blog)
    if (req.session.user) {
        const user = {email:req.session.user.email}
        res.render('view_blog', {user, blog })
        
    } else {
        
        
            res.render('view_blog', { blog })

    }
})

router.post('/submit-comment/:id', ensureAuth, async (req, res) => {

    const { comment } = req.body
    comment
    if (!comment) {
        req.flash('error_msg', 'Comment box required')
        res.redirect('/blogs/' + req.params.id)
    } else {
        
        let users = await User.findOne({ _id: req.session.user._id });
        if (users.user_status === "Premium") {
            let proid = req.params.id;
            let user = req.session.user;
            blogController.postComment(proid, user, req.body, (response) => {
                req.flash('success_msg', 'comment posted successfully')
                res.redirect('/blogs/' + req.params.id,)
            })
        
        }else{
            req.flash('error_msg', 'Only Premium users can comment')
            res.redirect('/blogs/' + req.params.id)
        }
        

    }
});

router.post('/submit-rating/:id', ensureAuth, async (req, res) => {
    if (!req.body.rating) {
        req.flash('error_msg', 'Rating required')
        res.redirect('/blogs/' + req.params.id)
    } else if (req.body.rating < 1 || req.body.rating > 5) {
        req.flash('error_msg', 'Rating not more than 5 and not less than 1')
        res.redirect('/blogs/' + req.params.id)
    } else {
        let users = await User.findOne({ _id: req.session.user._id });
        if (users.user_status === "Premium") {
            let proid = req.params.id;
            let user = req.session.user;
            let rating = await blogController.postrating(proid, user, req.body.rating);
            let averagerating = await blogController.getAvaragerating(req.body.userId)
            console.log("average:"+averagerating)
            if(averagerating.length > 0) {
                userControllers.updateUserRating(averagerating,req.body.userId)
                req.flash('success_msg', 'Thank you for posting your rating');
                res.redirect('/blogs/' + req.params.id,)
            }else{
                req.flash('success_msg', 'Thank you for posting your rating');
                res.redirect('/blogs/' + req.params.id)
            }
                
            // })
        } else {
            req.flash('error_msg', 'Only Premium users can give rating')
            res.redirect('/blogs/' + req.params.id)
        }
       
        

    }

});

router.get('/article/:id', async(req, res)=>{
    if(req.session.topicmanager) {
        let topicmgr = req.session.topicmanager.email
        let blog = await blogController.getOneBlog(req.params.id);
        let topic = await topicController.getOne(blog.topic);
        blog.topicdetails = {...topic}
        res.render('user/viewblog', { blog, topicmgr})
    }
    
    
});

router.get('/topics/:id', async(req,res) => {
    let article = await blogController.getfindByTopicToUser(req.params.id);
    let topics = await topicController.getTopics();
    for(let i = 0; i < article.length; i++) {
            let topic = await topicController.getOne(article[i].topic);
            let author = await userControllers.getOneUser(article[i].userid);
            article[i].topicdetails = {...topic}
            article[i].userdetails = {...author}
        }
    if (req.session.user) {
        let user = {email: req.session.user.email};

        res.render('home', { article, user,topics })
    } else if(req.session.admin){
        let admin = req.session.admin.email;

        res.render('home', { article, admin ,topics})
    } else if(req.session.topicmanager){
        let topicmgr = req.session.topicmanager.email;

        res.render('home', { article, topicmgr,topics })
    }else {
        
        res.render('home', { article,topics})
    }
})
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        console.log('Logout success')
    })

    res.redirect('/')
})
module.exports = router;
