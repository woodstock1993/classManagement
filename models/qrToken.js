const Sequelize = require('sequelize');

class QRToken extends Sequelize.Model {
    static initiate(sequelize) {
        QRToken.init({
            nonce: {
                type: Sequelize.STRING(32),
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'QRToken',
            tableName: 'qr_tokens',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }
    static associate(db) {
        db.QRToken.hasMany(db.Attendance, { foreignKey: 'qrTokenId', sourceKey: 'id' });
    };
}

module.exports = QRToken;