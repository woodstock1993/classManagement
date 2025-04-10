const jwt = require('jsonwebtoken');

const { sequelize } = require('../models/index');

const DeviceToken = require('../models/deviceToken');
const UserParentRelation = require('../models/userParentRelation');
const ParentDeviceToken = require('../models/parentDeviceToken');


exports.saveDeviceToken = async (req, res) => {
  const accessToken = req.cookies.token;
  const decoded = jwt.decode(accessToken);
  const { token, platform, browserType } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const userParents = await UserParentRelation.findAll({
      where: { parentId: decoded.id },
      transaction,
    });

    if (!userParents) {
      await transaction.rollback();
      return res.status(404).json({ error: '학생과 학부모 관계를 찾을 수 없습니다.' });
    }

    if (!token || !platform) {
      await transaction.rollback();
      return res.status(400).json({ error: 'token and platform are required.' });
    }

    let deviceToken = await DeviceToken.findOne({
      where: { token: token },
      transaction,
    });

    if (!deviceToken) {
      try {
        deviceToken = await DeviceToken.create({
          token: token,
          platform: platform,
          browser: browserType,
          parentId: decoded.id
        }, { transaction });
      } catch (error) {
        console.error('DeviceToken 생성 중 오류 발생:', error);
        throw error;
      }
    }

    if (!deviceToken) {
      await transaction.rollback();
      return res.status(500).json({ error: 'Failed to create token.' });
    }

    const parentDeviceTokens = await Promise.all(userParents.map(async (userParent) => {
      const [parentDeviceToken, created] = await ParentDeviceToken.findOrCreate({
        where: {
          userParentRelationId: userParent.id,
          deviceTokenId: deviceToken.id,
        },
        defaults: {
          userParentRelationId: userParent.id,
          deviceTokenId: deviceToken.id,
        },
        transaction,
      });

      return parentDeviceToken;
    }));
    await transaction.commit();

    res.status(201).json({
      message: 'Token saved successfully.',
      deviceTokens: parentDeviceTokens,
    });
  } catch (error) {
    console.error('오류 발생:', error);

    await transaction.rollback();
    res.status(500).json({ error: 'Failed to save token.' });
  }
};

