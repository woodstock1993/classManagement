const Sequelize = require('sequelize');

class Attendance extends Sequelize.Model {
    static initiate(sequelize) {
        Attendance.init({
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            qrTokenId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'qr_tokens',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            }
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Attendance',
            tableName: 'attendances',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Attendance.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });
        db.Attendance.belongsTo(db.QRToken, { foreignKey: 'qrTokenId', targetKey: 'id' });
    }
}

module.exports = Attendance;
