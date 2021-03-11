require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require('passport');
const Link = require('./models/links');
const User = require('./models/User')
const {
    ensureAuth,
    ensureGuest
} = require('./middleware/auth');

require('./config/passport')(passport)

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(__dirname + '/public'));
app.use(
    session({
        secret:process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: null
        }
    })
);
app.use(passport.initialize())
app.use(passport.session())
app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection
    .once('open', () => {
        console.log(`connected to database`)
    })
    .on('error', (err) => {
        console.log(`error: ${err}`)
    });
mongoose.set('useFindAndModify', false);

app.get('/', ensureGuest, (req, res) => {
    res.render('login')
});

app.get('/admin', ensureAuth, (req, res) => {
    console.log(req.user.id)
    Link.find({ owner: req.user.id }, (err, data) => {
        res.render('dashboard', {
            user: req.user,
            data
    })
    })
})

app.post('/addlink',ensureAuth, (req,res)=> {
    newlink = new Link({
        owner: req.user.id,
        title: req.body.title,
        link:req.body.url
    })
    newlink.save().then(() => {
        res.redirect('/')
    })
})
app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));


app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/admin',
        failureRedirect: '/'
}));
app.get('/logout', ensureAuth, (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/:user', (req, res) => {
    User.findOne({ onelink: req.params.user }, (err, data) => {
        Link.find({ owner: data.id }, (err, links) => {
            res.render('links', {
                links,
                ownerimage: data.image,
                owneronelink:data.onelink
            })
        })
    })
})


app.listen(3000, () => {
    console.log(`server started in port 3000`)
})