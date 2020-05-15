const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB config

const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB Connected.....'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;


// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Body Parser
app.use(express.urlencoded({ extended: false }));

// express Session MiddleWare
app.use(session({
    secret: 'Secret',
    resave: true,
    saveUninitialized: true,
}));
// Passport middle Ware
app.use(passport.initialize());
app.use(passport.session());

// connect Flash 
app.use(flash());

// Global Var
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// ==================
// Routes
// ===================

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});