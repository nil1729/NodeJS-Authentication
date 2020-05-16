const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async(email, password, done) => {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: 'Email is not Registered' });
            } else {
                try {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (isMatch) {
                        return done(null, user, { message: 'You are now Logged in' });
                    }
                    return done(null, false, { message: `Password don't Match` });
                } catch (e) {
                    console.log(e);
                    return done(e);
                }
            }
        } catch (e) {
            console.log(e);
            return done(e);
        }
    }));
    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            return done(err, user);
        });
    });
};