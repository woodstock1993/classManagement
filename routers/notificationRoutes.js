const config = require('../config/config.json');
const express = require('express');
const router = express.Router();
const { verifyToken, } = require('../middleware/auth');
const { saveDeviceToken, } = require('../controllers/notificationController');
const { sendAttendanceNotification, } = require('../service/notification');

router.post('/token', verifyToken, saveDeviceToken);

router.post('/alarm', async (req, res) => {
    try {
        const { userParentId, childName } = req.body;

        if (!userParentId || !childName) {
            return res.status(400).json({ error: 'parentId와 childName은 필수 입력 항목입니다.' });
        }

        const result = await sendAttendanceNotification(userParentId, childName);

        if (result) {
            res.json({ message: '알림이 성공적으로 전송되었습니다.' });
        } else {
            res.status(404).json({ error: '알림 전송에 실패했습니다.' });
        }
    } catch (error) {
        console.error('알림 전송 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

module.exports = router;