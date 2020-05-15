const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bcrypt = require('bcrypt');
const chalk = require('chalk');
const error = chalk.red;
const success = chalk.green;
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

// Db Connection
const connectDB = async() => {
    try {
        await mongoose.connect('mongodb://localhost/auths', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(success('MongoDB connected.....'));
    } catch (e) {
        console.log(error(e.name));
        console.log(error('Refused to Connect !!!'));
    }
};
connectDB();
// User Model
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
});
const User = mongoose.model("User", userSchema);

// View Engine Setup
app.set('view engine', 'ejs');
app.set(express.static(__dirname + '/public'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// AUthentication MiddleWare Setup

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('e_m', 'You Are not LOGIN Yet !!');
        res.redirect('/login');
    }
}


// Passport SetUp
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'Email Not Found' })
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user, { message: 'You Are Now Logged In' });
                } else {
                    return done(null, false, { message: 'Password Incorrect' });
                }
            });
        }).catch(e => {
            console.log(e);
        });
}));


app.use(session({
    secret: 'nilanjan Secret',
    resave: true,
    saveUninitialized: true
}));



// Passport middleWare
app.use(passport.initialize());
app.use(passport.session());
// Serialize Passport
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Flash Setup
app.use(flash());
app.use((req, res, next) => {
    res.locals.e = req.flash('error');
    res.locals.success_messages = req.flash('success');
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
// login
app.get('/login', (req, res) => {
    res.render('login');
});
// register
app.get('/register', (req, res) => {
    res.render('register');
});
// login POST
app.post('/login', passport.authenticate('local', {
    successFlash: true,
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {});


// register post
app.post('/register', async(req, res) => {
    let user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    try {
        const duplicate = await User.findOne({ email: user.email });
        if (duplicate == null) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            user = new User({
                name: user.name,
                email: user.email,
                password: hashedPassword
            });
            await user.save()
            req.flash('s_m', 'You are now Registered');
            res.redirect('/login');
        } else {
            res.render('register', { newUser: user });
        }
    } catch (e) {
        res.render('register', { newUser: user });
    }
});

app.get('/logout', (req, res) => {
    req.logOut();
    req.flash('s_m', 'You Are now LOGGED OUT');
    res.redirect('/login');
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(success(`Server started on port ${PORT}`));
});