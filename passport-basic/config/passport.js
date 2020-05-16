const LocalStrategy = require('passport-local').Strategy;
const User = require('./../models/User');
const bcrypt = require('bcrypt');
module.exports = async function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async function(email, password, done) {
        try {
            const user = await User.findOne({ email: email });
            if (!user) {
                return done(null, false, { message: 'Email Not Regitered Yet' });
            }
            try {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    return done(null, user, { message: 'You are now Logged In' });
                }
                return done(null, false, { message: 'Password Is INCORRECT' });
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
    }));
    // Serialize Passport
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};