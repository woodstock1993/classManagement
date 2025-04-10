const config = require('../config/config');
const passport = require('passport');
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require('../models/user');


module.exports = () => {
    passport.use('google', new GoogleStrategy({
        clientID: config.GOOGLE.CLIENT_ID,
        clientSecret: config.GOOGLE.GOOGLE_CLIENT_SECRET,
        callbackURL: `${config.PROTOCOL}://${config.HOST}${config.GOOGLE.GOOGLE_CALLBACK_URL}`,
        scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const exUser = await User.findOne({
                where: { snsId: profile.id, provider: 'google' },
            });
            if (exUser) {
                done(null, exUser);
            } else {
                const newUser = await User.create({
                    email: profile._json?.email,
                    name: profile._json.name,
                    snsId: profile.id,
                    provider: 'google',
                });
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};

