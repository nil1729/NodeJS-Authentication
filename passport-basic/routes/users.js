const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

// register
router.get('/register', (req, res) => {
    res.render('register');
});

// register post
router.post('/register', async(req, res) => {
    async function foundDuplicate(email) {
        const duplicate = await User.findOne({ email: email });
        if (duplicate) {
            return true;
        }
        return false;
    }
    let errors = [];
    let newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    const nameRagex = /^[a-zA-Z ]*$/;
    const emailRagex = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    if (newUser.password.length < 6) {
        errors.push({
            msg: 'Password Should Be atleast 6 characters'
        });
    }
    if (!nameRagex.test(newUser.name)) {
        errors.push({
            msg: 'Name Should Have Only Alphabates'
        });
    }
    if (!emailRagex.test(newUser.email)) {
        errors.push({
            msg: 'Email Should Be Valid'
        });
    }
    if (await foundDuplicate(newUser.email)) {
        errors.push({
            msg: 'Email already Reagistered'
        });
    }
    if (errors.length === 0) {
        try {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            const user = new User({
                name: newUser.name,
                email: newUser.email,
                password: hashedPassword
            });
            await user.save();
            req.flash('s_m', 'You are now Registered');
            res.redirect('/users/login');
        } catch (e) {
            console.log(e);
            res.render('register', { newUser: newUser });
        }
    } else {
        res.render('register', { errors: errors, newUser: newUser });
    }
});


// Login
router.get('/login', (req, res) => {
    res.render('login');
});

// login POST
router.post('/login', passport.authenticate('local', {
    successFlash: true,
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}), (req, res) => {});

// Logout 
router.get('/logout', (req, res) => {
    req.isAuthenticated();
    req.flash('s_m', 'You are now logged Out');
    res.redirect('/users/login');
});


module.exports = router;