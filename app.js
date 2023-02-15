const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path')

const userRouter = require('./router/user');
const indexRouter = require('./router/index');
const adminRouter = require('./router/admin');

const app = express()

require('./config/passportsignup')(passport);
require('./config/passportlogin')(passport);

mongoose.set('strictQuery', false)
const db = 'mongodb+srv://safadmt:QwJPwnC8sPH5WGVc@cluster0.9ekwixw.mongodb.net/medium_vlog?retryWrites=true&w=majority'
mongoose.connect(db, err=> err? console.log(err) : console.log('Database connected'))



app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/'}));
app.use(express.static(path.join(__dirname , 'public')));

app.use(bodyParser.urlencoded({extended:false}));
app.use(session({secret: 'key', resave:true, saveUninitialized: true, cookie:{maxAge: 600000}}));
app.use((req, res, next)=> {
    if(!req.user) {
        res.header('Cache-control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache')
    }
    next();
})
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req,res,next)=> {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

app.use('/users', userRouter);
app.use('/', indexRouter);
app.use('/admin', adminRouter)

app.listen(3000, err=> err? console.log(err) : console.log('Server connected to port 3000'));