if(process.env.NODE_ENV !== 'production'){
   require('dotenv').config(); 
};

const express = require('express');
const app = express();
const PORT = 5000 || process.env.PORT
const URI = `http://localhost:${PORT}`;
const mongoURI = 'mongodb://localhost/confirm-email';
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));

const connectDB = async () => {
     try{
        await mongoose.connect(mongoURI, {
            useFindAndModify: false,
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log('MOngoDB Connected ....');
    }catch(e){
        console.log(e);
    }
};

connectDB();

// Passport
const passportConfig = async() => {
    passport.use(new LocalStrategy({usernameField: 'email'}, async(email, password, done)=>{
        try{
            const user = await User.findOne({email});
            if(!user){
                return done(null, false, {message: 'Authentication Error'});
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return done(null, false, {message: 'Authentication Error'});
            }
            if(!user.emailVerified){
                return done(null, false, {message: 'Please Verify your Email'});
            }
            return done(null, user);
        }catch(e){
            return done(e);
        }
    }));
    passport.serializeUser((user, done)=>{
        return done(null, user._id);
    });
    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user)=>{
            return done(err, user);
        });
    });
};
passportConfig();
app.use(session({
    resave:false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});


app.get('/', (req, res) => {
    res.json({
        login: `${URI}/login`,
        register: `${URI}/register`
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

const createTokenAndSend = async (user) => {
    const secret = process.env.JWT_SECRET;
    const payload = {
        user: user._id,
    };
    jwt.sign(payload, secret, {expiresIn: '60000'}, async(err, token)=>{
        if(err){
                return 'error';
        }
        const html =  `<a href=${URI}/verify/${payload.user}/${token}>Verify Your Email</a>`;
        // Mail options
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.PASSWORD
            }
        });
        
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Email Confirmation Request',
            text: 'Verify Email',
            html: html // URL For Confirmation
        };
        try{
            const info = await transporter.sendMail(mailOptions);
            return 'success';
        }catch(e){
            return 'error';
        }
            
    });
};
const checkAuthentication = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('error', 'You are not logged in');
         res.redirect('/login');
    }
};

app.get('/secret', checkAuthentication, (req, res)=> {
    const {email, name, emailVerified} = req.user;
    res.json({
         user: {
            email,
            name,
            emailVerified
         },
         logout: `${URI}/logout`
     });
});

app.post('/register', async(req, res) => {
    const user = new User(req.body.user);
    user.password = await bcrypt.hash(user.password, 10);
    try{
        await user.save();
        await createTokenAndSend(user);
        req.flash('success', 'Successfully Registered, Email Sent');
        res.redirect('/login');
    }catch(e){
         req.flash('error', 'Email already regitered');
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {
    successFlash:true,
    failureFlash: true,
    successRedirect:'/secret',
    failureRedirect:'/login'
}),(req, res) => {});

app.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'Successfully Logged out');
     res.redirect('/login');
});

app.get('/verify/:user/:token', async (req, res) => {
    try{
        let user = await User.findById(req.params.user);
        if(!user){
            req.flash('error', 'Invalid Request');
            return res.redirect('/register');
        }
        if(user.emailVerified){
            req.flash('success', 'Email already Verified');
            return res.redirect('/login'); 
        }
        const secret = process.env.JWT_SECRET;
        jwt.verify(req.params.token, secret, async (err, decoded) => {
            if(err){
                req.flash('error', 'Email Verification Token Expired');
                return res.redirect('/login');
            }
            user.emailVerified = true;
            await User.findByIdAndUpdate(user._id, user);
            await user.save();
            req.flash('success', 'Email Verified');
            return res.redirect('/login'); 
        });
    }catch(e){
        res.json({
            msg: e
        });
    }
});

app.post('/verify/resend', async(req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user){
            req.flash('error', 'Email not Registered');
            return  res.redirect('/login');
        }
        await createTokenAndSend(user);
        req.flash('success', 'Successfully Registered, Email Sent');
        res.redirect('/login');
    } catch (e) {
        req.flash('errorr', 'Server Error');
        res.redirect('/login');
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});


