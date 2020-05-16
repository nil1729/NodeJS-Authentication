require('dotenv').config();

const express = require('express');
const app = express();
const key = require('./config/keys').mongoURI;
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


// Database Connect
require('./config/db')(key);
// Passport configuraton
require('./config/passport')(passport);

// View Engine Setup
app.set('view engine', 'ejs');


// Body Parser Setup
app.use(express.urlencoded({ extended: true }));


// Session setup 
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));

// passport Setup
app.use(passport.initialize());
app.use(passport.session());


// Flash Setup
app.use(flash());

// Global Vars For Flash Messages
app.use((req, res, next) => {
    res.locals.s_m = req.flash('success');
    res.locals.e_m = req.flash('error');
    next();
});

// Welcome Route
app.get('/', (req, res) => {
    res.render('welcome');
});

// Routes
app.use('/users', require('./routes/users'));
app.use('/', require('./routes/secret'));


// Server Setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});