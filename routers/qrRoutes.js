const express = require('express');
const router = express.Router();

const { createQRCode, generateQRImage } = require('../service/qr');
const { kakaoAuthenticated, } = require('../middleware/auth');
const { checkAttendance } = require('../service/attendance');
const { verifyToken } = require('../middleware/auth');

router.get('/scan', verifyToken, checkAttendance);
router.get('/image', generateQRImage);
router.post('/code', createQRCode);

module.exports = router;
