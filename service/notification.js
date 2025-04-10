const { ParentDeviceToken, DeviceToken } = require('../models');
const fcmService = require('./fcmService');

exports.sendAttendanceNotification = async (userParentId, childName) => {
    try {
        const ParentDeviceTokens = await ParentDeviceToken.findAll({
            where: { userParentRelationId: userParentId },
        });

        if (ParentDeviceTokens.length === 0) {
            console.log(`Parent ID ${parentId}에 대한 디바이스 토큰이 없습니다.`);
            return false;
        }

        const notificationPromises = ParentDeviceTokens.map(async ParentDeviceToken => {
            if (!ParentDeviceToken) {
                console.error(`ParentDeviceToken을 찾지 못했습니다.`);
                return;
            }

            const id = ParentDeviceToken.deviceTokenId;
            const deviceToken = await DeviceToken.findOne({
                where: {
                    id: id,
                    deletedAt: null,
                }
            })
            if (!deviceToken) {
                console.error(`DeviceToken을 찾지 못했습니다.`);
                return;
            }
            try {
                const success = await fcmService.sendPushNotification({
                    title: '출석 확인 알림',
                    body: `${childName} 학생이 학원에 도착했습니다.`,
                    token: deviceToken.dataValues.token,
                });
                return success
            } catch (error) {
                console.error(`토큰 ${deviceToken.dataValues.token}에 대한 알림 전송 실패:`, error);
                return null;
            }
        });

        const results = await Promise.all(notificationPromises);
        const successCount = results.filter(result => result === true).length;        
        console.log(`Parent ID ${userParentId}에게 ${successCount}/${ParentDeviceTokens.length} 알림이 성공적으로 전송되었습니다.`);
        return successCount > 0

    } catch (error) {
        console.error('알림 전송 중 오류 발생:', error);
        return false;
    }
};

exports.getDeviceTokens = async (parentId, childName) => {
    const ParentDeviceTokens = await ParentDeviceToken.findAll({
        where: { parentId: parentId },
    });

    if (ParentDeviceTokens.length === 0) {
        console.log(`Parent ID ${parentId}에 대한 디바이스 토큰이 없습니다.`);
        return false;
    }
    return ParentDeviceTokens;
};

