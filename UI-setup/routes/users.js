const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

// register route
router.get('/register', (req, res) => {
    res.render('register');
});
// register Handle
router.post('/register', async(req, res) => {
    const foundDuplicate = async(email) => {
        try {
            const duplicate = await User.findOne({ email: email });
            if (duplicate) return true;
            return false;
        } catch (e) {
            return false;
            console.log(e);
        }
    };
    const errors = [];
    const nameRagex = /^[a-zA-Z ]*$/;
    const emailRagex = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    if (!nameRagex.test(newUser.name)) {
        errors.push({
            msg: `Name doesn't Contain any number or a special Charecter.`
        });
    }
    if (!emailRagex.test(newUser.email)) {
        errors.push({
            msg: `Email is not Valid. Please enter a valid Email.`
        });
    }
    if (newUser.password.length < 6) {
        errors.push({
            msg: `Password must contain atleast 6 Characters`
        });
    }
    if (await foundDuplicate(newUser.email)) {
        errors.push({
            msg: `Email is already Registered`
        });
    }
    if (errors.length > 0) {
        res.render('register', { errors: errors, newUser: newUser });
    } else {
        try {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            try {
                const savedUser = new User({
                    name: newUser.name,
                    email: newUser.email,
                    password: hashedPassword
                });
                await savedUser.save();
                req.flash('success', 'You are now Registered');
                res.redirect('/users/login');
            } catch (e) {
                res.render('register', { errors: { msg: 'Internal Server Error' }, newUser: newUser });
            }
        } catch (e) {
            res.render('register', { errors: { msg: 'Internal Server Error' }, newUser: newUser });
        }
    }
});
// Login

router.get('/login', (req, res) => {
    res.render('login');
});

// Login Handle 
router.post('/login', passport.authenticate('local', {
    successFlash: true,
    successRedirect: '/dashboard',
    failureFlash: true,
    failureRedirect: '/users/login'
}), (req, res) => {});

// logout
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'You Succesfully Logged out')
    res.redirect('/users/login');
});



module.exports = router;