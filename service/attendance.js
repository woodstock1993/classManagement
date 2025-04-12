const jwt = require('jsonwebtoken');

const moment = require('moment');
const User = require('../models/user');

moment.tz.setDefault("Asia/Seoul");

const { Op } = require("sequelize");
const { QRToken, Attendance, Parent, UserParentRelation } = require('../models');

const { sendAttendanceNotification } = require('../service/notification')

exports.checkAttendance = async (req, res) => {
    try {
        res.locals.decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        const decode = res.locals.decoded;
        const userId = decode.id;
        const email = decode.email;

        const user = await User.findOne({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(404).json({ eror: "가입하지 않은 유저 입니다" });
        }
        const qrData = req.query.token;
        
        const today = moment().startOf('day');
        const tomorrow = moment(today).add(1, 'days');

        if (!qrData || !userId) {
            return res.status(400).json({ error: "qr token 값이 필요합니다." });
        }

        const qrToken = await QRToken.findOne({
            where: {
                nonce: qrData,
                createdAt: {
                    [Op.gte]: today.toDate(),
                },
                expiresAt: {
                    [Op.lt]: tomorrow.toDate(),
                }
            },
        });

        if (!qrToken) {
            return res.status(404).json({ error: "유효한 QR Code를 찾지 못하였습니다." });
        }

        const existingAttendance = await Attendance.findOne({
            where: {
                userId: userId,
                qrTokenId: parseInt(qrToken.id),
            }
        });

        if (existingAttendance) {
            return res.render('double-attendance', {
                title: '오늘 출석 이미 완료',
                user: req.user,
                homeUrl: `/?email=${encodeURIComponent(email)}`,
            });
        }

        if (!qrToken) {
            return res.status(404).json({ error: "유효하지 않은 QR 코드입니다." });
        }

        const attendance = await Attendance.create({
            userId: userId,
            qrTokenId: parseInt(qrToken.id),
        });

        const userParents = await UserParentRelation.findAll({
            where: { userId: userId }
        })

        if (userParents && userParents.length > 0) {
        } else {
            console.log('관련된 부모가 없습니다.');
            return;
        }        
        const notificationPromises = userParents.map(userParent =>
            sendAttendanceNotification(userParent.id, user.name)
                .catch(error => {
                    console.error(`UserParent ID ${userParent.id}에 대한 알림 전송 실패:`, error);
                    return null;
                })
        );

        const results = await Promise.all(notificationPromises);
        const successCount = results.filter(result => result !== null).length;
        console.log(`${successCount}/${userParents.length}명의 부모에게 알림을 발송했습니다.`);

        return res.render("attendance", {
            title: "출석 확인 완료!",
            user: req.user,
            homeUrl: `/?email=${encodeURIComponent(email)}`,
        });

    } catch (error) {
        console.error("출석 확인 중 오류 발생:", error);
        return res.status(500).json({ error: "재로그인이 필요합니다." });
    }
}