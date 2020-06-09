const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const Speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const flash = require('connect-flash');

// View Engine Setup
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// Session for Flash Messages
app.use(session({
    secret: 'nilanjan',
    resave: true,
    saveUninitialized: true
}));

// Flash Setup
app.use(flash());
app.use((req, res, next)=> {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Index Route
app.get('/', (req, res)=> {
    res.render('index');
});

// POST request to generate OTP
app.post('/totp/secret', (req, res) => {
    const secret = Speakeasy.generateSecret({length: 20});
    const token = Speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        window: 1,
    })
    const payload = {
        email: req.body.email,
        secret: secret.base32
    };
    const html = `<h1>${token}</h1>`;
    // JWT For extra layer for Security
    jwt.sign(payload, 'nilanjan', {expiresIn: '60000'}, async(err, jwtToken)=> {
        if(err){
            return res.redirect('/');
        }
            // OTP sending via Email
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'nilanjan.dev.1729@gmail.com',
                    pass: '#John@1729'
                }
            });
            
            let mailOptions = {
                from: 'nilanjan.dev.1729@gmail.com',
                to: req.body.email,
                subject: 'OTP Verification',
                text: 'Verify OTP',
                html: html // OTP
            };
            try{
                await transporter.sendMail(mailOptions);
                req.flash('success', 'OTP sent to your email');
                // Redirect to verification Page
                res.redirect(`/${jwtToken}/verify`);
            }catch(e){
                req.flash('error', 'Server Error');
                return  res.redirect(`/`);
            }
    });
});


// Verification Page (GET)
app.get('/:jwtToken/verify', (req, res) => {
    res.render('verify', {secret: req.params.jwtToken});
});

// Verify The OTP
app.post('/totp/verify/:jwtToken', (req, res) => {
    jwt.verify(req.params.jwtToken, 'nilanjan', (err, decoded)=> {
        if(err){
            req.flash('error', 'Token Expired');
            return  res.redirect('/');
        }
        var tokenValidates = Speakeasy.totp.verify({
            secret: decoded.secret,
            encoding: 'base32',
            token: req.body.token,
            window: 1
        });
        if(tokenValidates){
            // Here goes the further steps for Registering the User details
             return res.json({
                 msg: 'Success'
             });
        }
        req.flash('error', 'OTP is not valid');
        return  res.redirect('/');
    });
});

// Server PORT
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});