const express = require('express');
const router = express.Router();
const { isParentLoggedIn, isNotParentLoggedIn, logout } = require('../passport/middleware');
const { verifyToken } = require('../middleware/auth')
const { addChildToParent, deleteChildToParent, getChild,
    parentLogin, parentJoin,
} = require('../controllers/parentController');

const { renderParentDashBoard, renderParentJoin, renderParentLogin, renderParentSearchChild } = require('../controllers/parentController');

router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

router.get('/child', verifyToken, getChild);
router.post('/child', verifyToken, addChildToParent);
router.delete('/child', verifyToken, deleteChildToParent);

router.get('/login', isNotParentLoggedIn, renderParentLogin);
router.get('/join', isNotParentLoggedIn, renderParentJoin);

router.post('/login', isNotParentLoggedIn, parentLogin);
router.post('/join', isNotParentLoggedIn, parentJoin);

router.get('/logout', isParentLoggedIn, logout, (req, res) => {
    res.redirect('/parent/login');
});

router.get('/dashboard', verifyToken,  renderParentDashBoard);
router.get('/search', verifyToken, renderParentSearchChild);

module.exports = router;