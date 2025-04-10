const config = require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'production'}` });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../models/user');
const Academy = require('../models/academy');
const EmailVerification = require('../models/emailVerification');


exports.renderUserLogin = async (req, res, next) => {
    res.render('user-login', { title: 'User-Login' });
}

exports.renderUserJoin = async (req, res, next) => {
    res.render('user-join', { title: 'User-Join' });
}

exports.renderUserHome = async (req, res, next) => {
    res.render('user-home', { title: 'User-Home' });
}

exports.getUser = async (req, res) => {
    const { name } = req.query;
    try {
        const user = await User.findAll({
            where: {
                name: name
            },
            attributes: ['id', 'name', 'email']
        })
        if (!user) {
            return res.status(404).json({ message: '찾는 학생이 없습니다' });
        }
        const endPoint = `${process.env.PROTOCOL}://${process.env.BASE_URL}`;

        return res.json({ user, endpoint: endPoint });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.userLogin = async (req, res, next) => {
    passport.authenticate('local-user', { session: false }, (authError, user, info) => {
        if (authError) {
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/user/login/?error=${info.message}`);
        }

        const token = jwt.sign({
            email: user.email,
            name: user.name,
            type: 'user',
        }, process.env.JWT_SECRET, {
            expiresIn: '15m',
            issuer: 'woodstock93',
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
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
        
        return res.json({
            name: user.name,
            type: 'user',
            success: true,
            token: token,
            refreshToken: refreshToken,
            redirectUrl: '/user/home'
        });
    })(req, res, next);
}

exports.userJoin = async (req, res) => {
    const {
        email,
        name,
        emailVerificationCode,
        phone,
        password,
        provider,
        academyCode
    } = req.body;

    try {
        const academy = await Academy.findOne({
            where: { code: academyCode }
        });

        if (!academy) {
            return res.status(400).json({
                success: false,
                message: '학원 코드가 유효하지 않습니다.'
            });
        }

        const existingUser = await User.findOne({
            where: {
                email: email,
                academyId: academy.id
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 가입한 이력이 있습니다.'
            });
        }

        const emailVerification = await EmailVerification.findOne({
            where: {
                email: email,
                token: emailVerificationCode,
                verified: true
            }
        });

        if (!emailVerification) {
            return res.status(400).json({
                success: false,
                message: '이메일을 인증해주세요.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            name,
            phone,
            password: hashedPassword,
            provider: provider,
            academyId: academy.id
        });

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                type: 'user'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '15m',
                issuer: 'woodstock93'
            }
        );

        return res.status(200).json({
            success: true,
            name: user.name,
            message: '회원가입이 완료되었습니다.',
            redirectUrl: '/user/login',
            token
        });

    } catch (error) {
        console.error('회원가입 에러:', error);
        return res.status(500).json({
            success: false,
            message: '회원가입에 실패하였습니다.',
            redirectUrl: '/user/join'
        });
    }
};