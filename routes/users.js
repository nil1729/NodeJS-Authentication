const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');

// User Model
const User = require('../models/User');
// Login Page 
router.get('/login', (req, res) => {
    res.render('login');
});
// Register Page
router.get('/register', (req, res) => {
    res.render('register');
});
// register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // check Required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'please fill in all fields' });
    }
    // Check Password Match
    if (password !== password2) {
        errors.push({ msg: 'Passwords not Match' });
    }

    // check pass length
    if (password.length < 6) {
        errors.push({ msg: 'password should be atleast 6 charecters' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation Passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User Exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                    });

                    // Hash password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // set password to hashed
                            newUser.password = hash;

                            // Save User
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('login');
                                }).catch(err => console.log(err));
                        }));
                }
            });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});
// LogOut Handle
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are Logged out');
    res.redirect('/users/login');
});
module.exports = router;