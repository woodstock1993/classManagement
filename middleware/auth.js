const express = require('express');

const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

exports.kakaoAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.provider === 'kakao') {
        return next();
    }
    const token = req.query.token;
    const loginUrl = `/auth/kakao?token=${token}`;
    res.redirect(loginUrl);
}

exports.processQRCode = (req, res, next) => {
    try {
        const qrData = req.query.token;
        if (!qrData) {
            return res.status(400).send('QR 코드 데이터가 제공되지 않았습니다.');
        }

        req.qrData = qrData;

        console.log('QR 코드 데이터:', qrData);
        next();
    } catch (error) {
        console.error('QR 코드 처리 중 오류:', error);
        res.status(500).send('QR 코드 처리 중 오류가 발생했습니다.');
    }
};

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('jwtToken is verified!!!');
        return next();
    } catch (accessError) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            const userType = req.cookies.type;
            console.log(userType);
            let redirectPath = "/user/login";
            if (userType === "parent") {
                redirectPath = "/parent/login";
            }
            return res.status(401).json({
                code: 401,
                message: "로그인이 필요합니다.",
                redirect: redirectPath,
            });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
            const newToken = jwt.sign(
                {
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    type: decoded.type,
                    type: "user",
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "15m",
                    issuer: "woodstock93",
                }
            );

            res.cookie("token", newToken, {
                httpOnly: true,
                secure: false,
                sameSite: "Strict",
            });
            res.locals.decoded = jwt.verify(newToken, process.env.JWT_SECRET);
            return next();
        } catch (refreshError) {
            let decodedType = null;
            try {
                const decoded = jwt.decode(refreshToken);
                decodedType = decoded?.type;
            } catch (_) { }

            const redirectPath =
                decodedType === "user" ? "/user/login" : "/parent/login";
            res.clearCookie("token");
            res.clearCookie("refreshToken");
            return res.status(401).json({
                code: 401,
                message: "로그인이 만료되었습니다. 다시 로그인해주세요.",
                redirect: redirectPath,
            });
        }
    }
};

exports.apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1분
    max: 20,
    handler(req, res) {
        res.status(this.statusCode).json({
            code: this.statusCode, // 기본값 429
            message: '1분에 열 번만 요청할 수 있습니다.',
        });
    },
});

exports.refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(403).json({ message: "Refresh Token이 없습니다." });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        return res.json({ accessToken: newAccessToken });

    } catch (err) {
        return res.status(403).json({ message: "Refresh Token이 유효하지 않습니다." });
    }
};