const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('config');
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: config.get('googleClientID'),
        clientSecret: config.get('googleClientSecret'),
        callbackURL: '/auth/google/callback',
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
            const newUser = {
                googleID: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                avatar: profile.photos[0].value,
                email: profile.emails[0].value
            };
            try{
                let user = await User.findOne({email: newUser.email});
                if(!user){
                    return done(null, user);  // Sign in By Google 
                    // return done(null, false); // Only Authorized Google Users
                }else{
                    return done(null, user);
                }
            }catch(e){
                return done(e);
            }     
        }
    ));
    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            return done(err, user);
        });
    });
};