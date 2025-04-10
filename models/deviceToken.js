const Sequelize = require('sequelize');

class DeviceToken extends Sequelize.Model {
    static initiate(sequelize) {
        DeviceToken.init({
            token: {
                type: Sequelize.STRING(256),
                allowNull: false,
                unique: true, // 중복된 토큰 방지
            },
            platform: {
                type: Sequelize.ENUM('web', 'android', 'ios'),
                allowNull: false, // 플랫폼 정보 필수
            },
            browser: {
                type: Sequelize.STRING(16),
                allowNull: false
            },
            parentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'parents', // Parent 테이블 이름
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'DeviceToken',
            tableName: 'device_tokens',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        }
        )
    }
    static associate(db) {
        db.DeviceToken.belongsTo(db.Parent, { foreignKey: 'parentId', targetKey: 'id' });
        db.DeviceToken.hasMany(db.ParentDeviceToken, { foreignKey: 'deviceTokenId', sourceKey: "id" });
    }
}

module.exports = DeviceToken;
