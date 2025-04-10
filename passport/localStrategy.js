const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const Parent = require('../models/parent');
const User = require('../models/user');

module.exports = () => {
    passport.use('local-user', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.use('local-parent', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: false,
    }, async (email, password, done) => {
        try {
            const parent = await Parent.findOne({ where: { email } });
            if (parent) {
                const result = await bcrypt.compare(password, parent.password);
                if (!result) {
                    return done(null, false, { message: 'Incorrect email or password.' });
                }
                const isMatch = await bcrypt.compare(password, parent.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect email or password.' });
                }
                return done(null, parent);
            }
        } catch (error) {
            return done(error);
        }
    }
    ))


};

