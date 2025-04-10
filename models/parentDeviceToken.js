const Sequelize = require('sequelize');

class ParentDeviceToken extends Sequelize.Model {
    static initiate(sequelize) {
        ParentDeviceToken.init({
            userParentRelationId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'user_parent_relations',
                    key: 'id',
                },
            },
            deviceTokenId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'device_tokens',
                    key: 'id',
                },
            },
            deletedAt: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false, // 기본적으로 "삭제되지 않음"
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ParentDeviceToken',
            tableName: 'parent_device_tokens',
            paranoid: false, // paranoid 끔!
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.ParentDeviceToken.belongsTo(db.UserParentRelation, { foreignKey: 'userParentRelationId', targetKey: 'id' });
        db.ParentDeviceToken.belongsTo(db.DeviceToken, { foreignKey: 'deviceTokenId', targetKey: 'id' });
    }
}

module.exports = ParentDeviceToken;
