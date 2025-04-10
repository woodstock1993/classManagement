const config = require('../config/config');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
    passport.use(new KakaoStrategy({
        clientID: config.KAKAO.CLIENT_ID,
        callbackURL: `${config.PROTOCOL}://${config.HOST}${config.KAKAO.CALLBACK_URL}`,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const qrData = req.session.qrToken;

            let user = await User.findOne({
                where: { snsId: profile.id, provider: 'kakao' },
            });
            if (!user) {
                user = await User.findOrCreate({
                    where: { email: profile._json?.kakao_account?.email },
                    defaults: {
                        email: profile._json?.kakao_account?.email,
                        name: profile.displayName,
                        snsId: profile.id,

                        // (수정) 동적 변경 필요
                        academyId: 1,
                        provider: 'kakao',
                    }
                });
                user = user[0]; // findOrCreate returns an array                
            }
            done(null, { ...user.toJSON(), type: 'student' });
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};