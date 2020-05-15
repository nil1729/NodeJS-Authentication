const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initializePassport(passport, getUserByEmail, getUserById) {
    const authenticateUser = async(email, password, done) => {
        const user = await getUserByEmail(email);
        if (user == null) {
            return done(null, false);
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (e) {
            return done(e);
        }
    };
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    });
}

module.exports = initializePassport;