const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const moment = require('moment');

const User = require('../models/user');
const Parent = require('../models/parent');
const EmailVerification = require('../models/emailVerification');
const Academy = require('../models/academy');

exports.join = async (req, res, next) => {
    const { email, name, phone, password, provider, academyId } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            name,
            password: hash,
            phone,
            provider,
            academyId
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
}

exports.login = (req, res, next) => {
    passport.authenticate('local-parent', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?error=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
};

exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
    });
    res.status(200).send("쿠키 제거 완료");
};

exports.verifyEmail = async (req, res) => {
    const { token, email } = req.body;

    try {
        const emailVerification = await EmailVerification.findOne({ where: { token, email } });

        if (!emailVerification) {
            return res.status(400).json({ message: '잘못된 인증 토큰 또는 이메일입니다.' });
        }

        const fiveMinutesAgo = moment().subtract(5, 'minutes');
        if (moment(emailVerification.requestedAt).isBefore(fiveMinutesAgo)) {
            return res.status(400).json({ message: '인증 토큰이 만료되었습니다.' });
        }

        emailVerification.verified = true;
        await emailVerification.save();
        res.status(200).json({ success: true, message: '이메일 인증이 완료되었습니다.' });
    } catch (error) {
        res.status(500).json({ success: false, message: '이메일 인증에 실패했습니다.' });
    }
};

exports.verifyAcademyCode = async (req, res) => {
    const { academyCode } = req.body;

    try {
        if (!academyCode) {
            return res.status(400).json({
                success: false,
                message: '학원 코드를 입력해주세요.'
            });
        }

        const academy = await Academy.findOne({
            where: { code: academyCode }
        });

        if (!academy) {
            return res.status(404).json({
                success: false,
                message: '존재하지 않는 학원 코드입니다.'
            });
        }

        return res.status(200).json({
            success: true,
            message: '유효한 학원 코드입니다.',
            academyInfo: {
                id: academy.id,
                name: academy.name
            }
        });

    } catch (error) {
        console.error('학원 코드 확인 중 오류:', error);
        return res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
};

exports.processLogin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const parent = await Parent.findOne({
            where: { email }
        })
        if (!parent) {
            return res.status(404).json({ success: false, message: '가입 이력이 없습니다.' });
        }

        const result = await bcrypt.compare(password, parent.password);
        if (!result) {
            return res.status(400).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

    } catch (error) {
        console.log(error);
    }
}

exports.getToken = (req, res) => {
    res.json(res.locals.decoded);
};

exports.createToken = async (req, res) => {

    const { email, password } = req.body;
    try {
        const user = await User.findOne({
            where: {
                email: email,
            },
        });

        const result = await bcrypt.compare(password, user.password);
        if (!result) {
            return res.status(400).json({ success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            type: 'user',
        }, process.env.JWT_SECRET, {
            expiresIn: '15m',
            issuer: 'woodstock',
        });

        const refreshToken = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
        }, process.env.REFRESH_SECRET, {
            expiresIn: '30m',
            issuer: 'woodstock',
        });

        res.cookie("token", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
        });

        return res.json({
            code: 200,
            message: '토큰이 발급되었습니다',
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
};