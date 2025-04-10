const jwt = require('jsonwebtoken');

const { Attendance, User, UserParentRelation } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

exports.getAttendance = async (req, res) => {
    try {
        res.locals.decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        const parentId = res.locals.decoded.id;
        const oneMonthAgo = moment().subtract(1, 'months').toDate();

        const parentWithChildren = await UserParentRelation.findAll({
            where: {
                parentId: parentId,
                deletedAt: false,
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                },
            ]
        })
        if (!parentWithChildren) {
            return res.status(404).json({ error: 'Parent not found or no children associated.' });
        }

        const children = parentWithChildren.map(parent => parent.User);
        const attendanceData = await Promise.all(children.map(async (child) => {
            const attendances = await Attendance.findAll({
                where: {
                    userId: child.id,
                    createdAt: { [Op.gte]: oneMonthAgo }
                },
                order: [['createdAt', 'DESC']]
            });

            return {
                childName: child.name,
                attendances: attendances.map(att => ({
                    date: moment(att.createdAt).format('YYYY-MM-DD HH:mm:ss'),
                    status: 'Attended'
                }))
            };
        }));
        res.json(attendanceData);
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};