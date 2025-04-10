const admin = require('../config/firebase-config');
const ParentDeviceTokens = require('../models/parentDeviceToken');
const DeviceToken = require('../models/deviceToken');

exports.sendPushNotification = async ({ title, body, token }) => {
    try {
        if (!token) {
            console.error('Device token is missing.');
            return;
        }
        const message = {
            notification: { title, body },
            data: {
                title,
                body,
                customData: "자녀분이 학원에 출석하였습니다"
            },
            token: token,
        };

        const response = await admin.messaging().send(message);
        console.log('푸시 알림 전송 성공:', response);
        return true;
    } catch (error) {
        console.error('푸시 알림 전송 실패:', error);
        return false;
    }
};

async function removeInvalidToken(token) {
    try {
        const deviceToken = await DeviceToken.findOne({ where: { token: token } });

        if (deviceToken) {
            await ParentDeviceTokens.destroy({
                where: { deviceTokenId: deviceToken.id }
            });

            await deviceToken.destroy();

            console.log('유효하지 않은 토큰 삭제 완료:', token);
        } else {
            console.log('삭제할 토큰을 찾을 수 없습니다:', token);
        }
    } catch (error) {
        console.error('토큰 삭제 중 오류 발생:', error);
    }
}