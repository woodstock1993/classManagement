const Sequelize = require('sequelize');

class UserParentRelation extends Sequelize.Model {
    static initiate(sequelize) {
        UserParentRelation.init({
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                    onDelete: 'CASCADE',
                },
            },
            parentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'parents',
                    key: 'id',
                    onDelete: 'CASCADE',
                },
            },
            deletedAt: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'UserParentRelation',
            tableName: 'user_parent_relations',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
    static associate(db) {
        db.UserParentRelation.hasMany(db.ParentDeviceToken, { foreignKey: 'deviceTokenId', sourceKey: "id" });
        db.UserParentRelation.belongsTo(db.User, { foreignKey: 'userId' });
        db.UserParentRelation.belongsTo(db.Parent, { foreignKey: 'parentId' });
    }
}

module.exports = UserParentRelation;