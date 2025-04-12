const { sequelize } = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const Academy = require('../models/academy');
const EmailVerification = require('../models/emailVerification');
const Parent = require('../models/parent');
const DeviceToken = require('../models/deviceToken');
const ParentDeviceToken = require('../models/parentDeviceToken');
const User = require('../models/user');
const UserParentRelation = require('../models/userParentRelation');

exports.parentLogin = async (req, res, next) => {
    passport.authenticate('local-parent', { session: false }, (authError, user, info) => {
        if (authError) {
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/parent/login/?error=${info.message}`);
        }
        const token = jwt.sign({
            email: user.email,
            name: user.name,
            id: user.id,
            type: 'parent',
        }, process.env.JWT_SECRET, {
            expiresIn: '15m',
            issuer: 'woodstock93',
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
        });

        const refreshToken = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
        }, process.env.REFRESH_SECRET, {
            expiresIn: '30m',
            issuer: 'woodstock93',
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
        });

        return res.json({
            name: user.name,
            type: 'parent',
            success: true,
            token: token,
            refreshToken: refreshToken,
            redirectUrl: '/parent/dashboard'
        });
    })(req, res, next);
}

exports.parentJoin = async (req, res, next) => {
    const {
        email,
        name,
        emailVerificationCode,
        phone,
        password,
        provider,
        academyCode
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        const academy = await Academy.findOne({
            where: {
                code: academyCode,
            },
        })
        if (!academy) {
            return res.status(400).json({
                success: false,
                message: '학원 코드가 유효하지 않습니다.'
            });
        }

        const exParent = await Parent.findOne({
            where: {
                email: email,
                academyId: academy.id
            }
        })
        if (exParent) {
            return res.status(400).json({ success: false, message: '가입한 이력이 있습니다.' })
        }

        const emailVerification = await EmailVerification.findOne({
            where: {
                email: email,
                token: emailVerificationCode,
                verified: true,
            }
        })
        if (!emailVerification) {
            return res.status(400).json({ success: false, message: '이메일을 인증해주세요.' })
        }

        const parent = await Parent.create({
            email: email,
            name: name,
            phone: phone,
            password: hashedPassword,
            provider: provider,
            academyId: academy.id,
        });

        const token = jwt.sign(
            {
                id: parent.id,
                name: parent.name,
                email: parent.email,
                type: 'parent'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '15m',
                issuer: 'woodstock93'
            }
        );

        return res.status(200).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            redirectUrl: '/parent/login',
            token
        });

    } catch (error) {
        console.error('회원가입 에러:', error);
        return res.status(500).json({
            success: false,
            message: '회원가입에 실패하였습니다.',
            redirectUrl: '/parent/join'
        });
    }
}

exports.getChild = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ error: "이름(name) 파라미터가 필요합니다." });
        }

        const users = await User.findAll({
            where: { name }
        });

        return res.status(200).json(users);
    } catch (error) {
        console.error("자식 조회 실패:", error);
        return res.status(500).json({ error: "서버 오류" });
    }
};

exports.addChildToParent = async (req, res) => {
    const token = req.cookies.token;
    res.locals.decoded = jwt.verify(token, process.env.JWT_SECRET);
    const parentId = res.locals.decoded.id;

    const { childId } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const childUser = await User.findOne({ where: { id: childId }, transaction });
        if (!childUser) {
            await transaction.rollback();
            return res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
        }

        let userParentRelation = await UserParentRelation.findOne({
            where: { userId: childId, parentId },
            transaction,
        });

        if (userParentRelation) {
            userParentRelation.deletedAt = false;
            await userParentRelation.save({ transaction });
        } else {
            userParentRelation = await UserParentRelation.create({
                userId: childId,
                parentId,
                deletedAt: false,
            }, { transaction });
        }

        const userParentRelations = await UserParentRelation.findAll({
            where: {
                id: userParentRelation.id,
                deletedAt: false
            },
            transaction,
        });

        const latestDeviceToken = await DeviceToken.findOne({
            where: {
                parentId: parentId

            },
            order: [['updatedAt', 'DESC']],
            transaction,
        })

        for (const userParentRelation of userParentRelations) {
            const [parentDeviceToken, created] = await ParentDeviceToken.findOrCreate({
                where: {
                    userParentRelationId: userParentRelation.id,
                    deviceTokenId: latestDeviceToken.id,
                },
                defaults: {
                    deletedAt: false,
                },
                transaction,
            });

            if (!created && parentDeviceToken.deletedAt === true) {
                parentDeviceToken.deletedAt = false;
                await parentDeviceToken.save({ transaction });
            }
        }

        await transaction.commit();
        return res.status(200).json({
            success: true,
            message: userParentRelation._options.isNewRecord ? 'CREATE' : 'GET',
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Sequelize 오류:', error);
        return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.', details: error.message });
    }
};


exports.deleteChildToParent = async (req, res) => {
    const token = req.cookies.token;
    res.locals.decoded = jwt.verify(token, process.env.JWT_SECRET);
    const parentId = res.locals.decoded.id

    const { childId } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const user = await User.findOne({
            where: {
                id: childId,
            },
            transaction,
        })
        if (!user) {
            await transaction.rollback();
            res.status(404).json({ error: '학생을 찾을 수 없습니다.' });
        }
        const userParentRelation = await UserParentRelation.findOne({
            where: {
                userId: childId,
                parentId: parentId,
                deletedAt: false,
            },
            transaction,
        })

        if (userParentRelation) {
            userParentRelation.deletedAt = true;
            await userParentRelation.save({ transaction });
            console.log('UserParentRelation 삭제 완료');
        } else {
            console.log('UserParentRelation을 찾을 수 없습니다.');
        }
        await ParentDeviceToken.update(
            { deletedAt: true },
            {
                where: {
                    userParentRelationId: userParentRelation.id,
                },
                transaction,
            }
        );

        await transaction.commit();
        return res.status(204).json({
            message: 'UserParent Relation Destroyed',
        });

    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({ error: '서버 오류 발생' });
    }

}

exports.renderParentNotification = async (req, res, next) => {
    res.render('parent-notification', { title: 'Student Attendance' });
}

exports.renderParentJoin = async (req, res, next) => {
    res.render('parent-join', { title: 'Parent Login', error: null });
}

exports.renderParentDashBoard = (req, res) => {
    res.render('parent-dashboard', { title: 'Parent DashBoard', error: null });
};

exports.renderParentSearchChild = async (req, res, next) => {
    res.render('parent-search-user', { title: 'Parent Search', error: null });
}

exports.renderParentLogin = async (req, res, next) => {
    res.render('parent-login', { title: 'Parent Login', error: null });
}