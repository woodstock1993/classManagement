const Sequelize = require('sequelize');
const UserParentRelation = require('../models/userParentRelation');

class Parent extends Sequelize.Model {
    static initiate(sequelize) {
        Parent.init({
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: Sequelize.STRING(256),
                allowNull: false,
                unique: false,
            },
            name: {
                type: Sequelize.STRING(32),
                allowNull: true,
                defaultValue: 'anonymous',
            },
            phone: {
                type: Sequelize.STRING(15),
                allowNull: true,
                validate: {
                    is: /^[0-9\-+() ]*$/i, // 숫자, 하이픈(-), 괄호(), 공백만 허용
                },
            },
            password: {
                type: Sequelize.STRING(128),
                allowNull: false,
            },
            provider: {
                type: Sequelize.ENUM('web', 'kakao', 'apple', 'google'),
                allowNull: false,
                defaultValue: 'web',
            },
            academyId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'academies',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Parent',
            tableName: 'parents',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Parent.belongsToMany(db.User, { through: UserParentRelation, foreignKey: 'parentId', otherKey: 'userId' });
        db.Parent.belongsTo(db.Academy, { foreignKey: 'academyId', targetKey: 'id', onDelete: 'CASCADE' });
        db.Parent.hasMany(db.DeviceToken, { foreignKey: 'parentId', sourceKey: 'id' });
    }
}

module.exports = Parent;