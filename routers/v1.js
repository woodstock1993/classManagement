const express = require('express');
const router = express.Router();

const { verifyToken, apiLimiter } = require('../middleware/auth');
const { createToken, getToken } =  require('../controllers/authController');

router.get('/token', apiLimiter, verifyToken, getToken);
router.post('/token', apiLimiter, createToken);

module.exports = router;