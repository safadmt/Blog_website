const express = require('express');
const router = express.Router();
const Topicmanager = require('../models/topicmanger');
const bcrypt = require('bcryptjs');
const blogController = require('../controllers/blogController');
const TopicmanagerController = require('../controllers/topicmanagerController');
const userController = require('../controllers/userControllers');
const passport = require('passport');
const TopicController = require('../controllers/topicController');
const article = require('../models/article');
const Admin = require('../models/admin');
const topicController = require('../controllers/topicController');

function adminAuth(req,res, next) {
    if(req.session.admin) {
        next()
    }else{
        res.render('admin/adminlogin')
    }
}

router.get('/',adminAuth, async (req, res) => {
    let admin = req.session.admin.email
    
    res.render('admin/adminhome', { admin })
});
router.get('/login', (req, res) => {
    res.render('admin/adminlogin')
})
router.post('/login', (req, res, next) => {
   const {email , password} = req.body;
   if(!email || !password) {
    
    return res.render('admin/adminlogin', {error: 'Please fill up all the field'})
   }
   Admin.findOne({email: email})
   .then(admin=> {
    if(admin){
        bcrypt.compare(password, admin.password, (err, isMatch)=> {
            if(err) throw err
            if(isMatch) {
                req.session.admin = admin;
                req.flash('success_msg', 'Admin login successfull')
                res.redirect('/admin')
            }else{
                res.render('admin/adminlogin', {error: 'Password do not match'})
            }
        })
    }else{
        res.render('admin/adminlogin', {error: 'Email not registered'})
    }
   })
})
router.get('/topicmanager',adminAuth,  async (req, res) => {
    let admin = req.session.admin.email
    let topicmanager = await TopicmanagerController.getTopicManagers();
    for (let i = 0; i < topicmanager.length; i++) {
        let topic = await TopicController.getOne(topicmanager[i].topic);
        topicmanager[i].topicdetails = { ...topic };
    }
    console.log(topicmanager)
    res.render('admin/topicmanager', { topicmanager, admin })
});

router.get('/manage-users',adminAuth,  async (req, res) => {
    let admin = req.session.admin.email
    let users = await userController.getAllUser();
    res.render('admin/manage-users', { users, admin })
});

router.get('/manage-topics',adminAuth,  async (req, res) => {
    let admin = req.session.admin.email
    let topics = await TopicController.getTopics()
    res.render('admin/manage-topics', { admin, topics })
});
router.get('/manage-topics/add',adminAuth,  (req, res) => {
    let admin = req.session.admin.email
    res.render('admin/add-topics', { admin })
});

router.post('/manage-topics/add',adminAuth,  (req, res) => {

    if (!req.body.topic) {
        res.render('admin/add-topics', { error: 'Topic filed is required' })
    } else {
        TopicController.addTopic(req.body, (response) => {
            req.flash('success_msg', 'Topic added successfully')
            res.redirect('/admin/manage-topics')
        })
    }
});

router.get('/edit-topic/:id',adminAuth,  (req, res) => {
    let admin = req.session.admin.email
    TopicController.getOne(req.params.id).then(response => {
        res.render('admin/edit-topic', { response ,admin})
    })

})
router.post('/edit-topic/:id', adminAuth, (req, res) => {
    
    if (!req.body.topic) {
        req.flash('error_msg', 'Topic is required')
        res.redirect('/admin/edit-topic/' + req.params.id)
    } else {
        TopicController.updateOne(req.params.id, req.body, (response) => {
            req.flash('success_msg', ('Deleted successfully'));
            res.redirect('/admin/manage-topics')
        })
    }
});

router.get('/delete-topic/:id',adminAuth,  (req, res) => {
    TopicController.deleteOne(req.params.id, response => {
        req.flash('success_msg', ('Updated successfully'));
        res.redirect('/admin/manage-topics')
    })
})

router.get('/topicmanager/signup',adminAuth,  async (req, res) => {
    let admin = req.session.admin.email
    let topics = await TopicController.getTopics()
    res.render('admin/signuptopicmanager', { topics, admin })
})

router.get('/topicmanager/login', (req, res) => {
    res.render('admin/logintopicmanager')
})
router.get('/manage-articles',adminAuth,  async (req, res) => {
    let admin = req.session.admin.email
    let articles = await blogController.getArticleforadmin();
    for (let i = 0; i < articles.length; i++) {
        let topic = await TopicController.getOne(articles[i].topic);
        articles[i].topicdetails = { ...topic };
    }
    console.log(articles)
    res.render('admin/manage-articles', { articles ,admin})
});
router.get('/delete-article/:id',adminAuth,  (req, res) => {
    blogController.removeOneArticle(req.params.id, response => {
        req.flash('success_msg', 'Deleted successfully');
        res.redirect('/admin/manage-articles')
    })
})

router.post('/topicmanager/signup',adminAuth,  (req, res) => {
    const { topics, email, password } = req.body;
    console.log(req.body)
    if (!topics || !email || !password) {
        let user = { email, password }
        return res.render('admin/signuptopicmanager', { error: 'Please fill up all the field', user })
    } else {
        TopicmanagerController.addTopicManager(req.body, (response) => {
            req.flash('success_msg', 'Added topicmanager successfully')
            res.redirect('/admin/topicmanager')
        })
    }
});
router.get('/dashboared-topicmanager', async (req, res) => {
    if (req.session.topicmanager) {
        let topicmgr = req.session.topicmanager.email
        let topic = await TopicController.getOne(req.session.topicmanager.topic)
        let article = await blogController.getfindByTopic(req.session.topicmanager.topic);
        for (let i = 0; i < article.length; i++) {
            let topics = await TopicController.getOne(article[i].topic);
            article[i].topicdetails = topics
        }
        
        
        res.render('admin/topicmanager_home', {topicmgr, topicmanager: req.session.topicmanager, topic, article });
        
    } else {
        res.render('admin/logintopicmanager')
    }

})
router.post('/topicmanager/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('hello')
    if (!email || !password) {
        return res.render('admin/logintopicmanager', { error: 'Please fill up all the field' })
    } else {

        let topicmanager = await Topicmanager.findOne({ email: email }).lean()
        console.log(topicmanager)
        if (topicmanager) {
            let isMatch = await bcrypt.compare(password, topicmanager.password)
            
            if (isMatch) {
                req.session.topicmanager = topicmanager;
                req.flash('success_msg', 'Login success')
                res.redirect('/admin/dashboared-topicmanager')
            } else {
                req.flash('error_msg', 'Password do not match')
                res.redirect('/admin/topicmanager/login')
            }

        }else{
            let error =  'Email not registered'
            res.render('admin/logintopicmanager', {error,email,password})
        }
    }
});

router.post('/approveBlog', (req, res) => {
    console.log(req.body)
    blogController.updateApprove(req.body).then(response => {
        
        res.json(response)
    })
        .catch(err => {
            console.log(err)
        })
});

router.get('/edit_topicmanager/:id',adminAuth,  async(req, res) => {
    let admin = req.session.admin.email
    let topics = await topicController.getTopics();
    let response = await TopicmanagerController.getOneTopicManager(req.params.id)
    let topic = await topicController.getOne(response.topic);
   
    res.render('admin/edit_topic_manager', { admin, response,topic,topics})
});

router.post('/edit_topicmanager/:id', adminAuth, (req, res) => {
    console.log(req.body)
    
    const { topics, email, password } = req.body;
    if (!topics || !email || !password) {
        let user = { email, password }
        req.flash('error_msg', 'Please fill up all the field')
        return res.redirect('/admin/edit_topicmanager/' + req.params.id)
    } else {
        TopicmanagerController.updateOneTopicManager(req.params.id, req.body, (response) => {
           
            res.redirect('/admin/topicmanager')
        })
    }
});

router.get('/delete_topicmanager/:id',adminAuth,  (req, res) => {
    TopicmanagerController.delete_topic_manager(req.params.id, (response) => {

        req.flash('success_msg', 'Deleted One Topic manager successfully')
        res.redirect('/admin/topicmanager')
    })
})




module.exports = router;


