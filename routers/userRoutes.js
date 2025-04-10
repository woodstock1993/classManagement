const express = require('express');
const router = express.Router();
const { isUserLoggedIn, isNotUserLoggedIn } = require('../passport/middleware');
const { userJoin, getUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth')
const { renderUserLogin, renderUserJoin, renderUserHome, userLogin } = require('../controllers/userController')
const { renderParentNotification } = require('../controllers/parentController');
const { getAttendance } = require('../controllers/attendanceController');
const { swaggerUi, specs } = require('../swagger/swagger');

router.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

router.get('/', getUser);
router.get('/home', isUserLoggedIn, renderUserHome);
router.get('/attendance', verifyToken, renderParentNotification);

router.get('/login', isNotUserLoggedIn, renderUserLogin);
router.get('/join', isNotUserLoggedIn, renderUserJoin);

router.get('/history', verifyToken, getAttendance);

router.post('/join', isNotUserLoggedIn, userJoin);
router.post('/login',  userLogin);

module.exports = router;