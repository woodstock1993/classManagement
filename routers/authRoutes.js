const express = require('express');
const passport = require('passport');

const { getToken, logout, verifyEmail, } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth')
const { checkAttendance } = require('../service/attendance');
const { sendVerificationCode } = require('../service/auth');

const router = express.Router();

router.get('/token', verifyToken, getToken);
router.get('/logout', logout);

// KAKAO
router.get('/kakao', (req, res, next) => {
  const token = req.query.token;
  req.session.qrToken = token

  passport.authenticate('kakao', {
    state: token
  })(req, res, next);
});

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/?error=login_failed',
}), (req, res, next) => {
  console.log('kakao/call/back')
  const { id, qrData, email } = req.user;

  req.session.user = { id, qrData, email };

  next();
}, checkAttendance);


// GOOGLE
router.get('/google', passport.authenticate('google'));
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/?error=구글로그인 실패',
}), (req, res) => {
  res.redirect('/');
})

// 이메일 인증
router.post('/verification-code', sendVerificationCode);
router.post('/verification-email', verifyEmail);

module.exports = router;