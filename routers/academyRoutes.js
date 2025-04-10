const express = require('express');
const router = express.Router();
const { verifyAcademyCode } = require('../controllers/authController');

router.post('/code', verifyAcademyCode);

module.exports = router;