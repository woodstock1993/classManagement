const Sequelize = require('sequelize');
const UserParentRelation = require('../models/userParentRelation');

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({
            email: {
                type: Sequelize.STRING(256),
                allowNull: false,
                unique: true,
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
                allowNull: true,
            },
            provider: {
                type: Sequelize.ENUM('Desktop', 'android', 'ios',),
                allowNull: false,                
            },
            snsId: {
                type: Sequelize.STRING(30),
                allowNull: true,
            },
            academyId: {
                type: Sequelize.INTEGER,
                allowNull: true,
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
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.User.belongsTo(db.Academy, { foreignKey: 'academyId', targetKey: 'id', onDelete: 'CASCADE' });
        db.User.belongsToMany(db.Parent, { through: UserParentRelation, foreignKey: 'userId', otherKey: 'parentId' });
    }
}

module.exports = User;
