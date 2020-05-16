require('dotenv').config();

const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const mongoURI = require('./config/keys').mongoURI;
const connectDB = require('./config/db');
const checkAuthentication = require('./middleware/auth');

// Db Connection
connectDB(mongoURI);

// View Engine Setup
app.set('view engine', 'ejs');
app.set(express.static(__dirname + '/public'));

// Body parser Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport SetUp
require('./config/passport')(passport);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

// Passport middleWare
app.use(passport.initialize());
app.use(passport.session());

// Flash Setup
app.use(flash());
app.use((req, res, next) => {
    // Passport Messages
    res.locals.e = req.flash('error');
    res.locals.s = req.flash('success');
    // Own Setup
    res.locals.s_msg = req.flash('s_m');
    res.locals.e_msg = req.flash('e_m');
    next();
});

//Routes
app.get('/', checkAuthentication, (req, res) => {
    res.render('index', {
        name: req.user.name
    });
});


app.use('/users', require('./routes/users'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});