const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;

class EmailVerification extends Sequelize.Model {
    static initiate(sequelize) {
        EmailVerification.init({
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: { msg: '유효한 이메일을 입력해주세요.' },
                    notEmpty: { msg: '이메일은 필수입니다.' }
                },
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,                
                validate: {
                    notEmpty: { msg: '인증 토큰은 필수입니다.' }
                },
            },
            verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            requestedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        }, {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'EmailVerification',
            tableName: 'email_verifications',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db) {
    }
};

module.exports = EmailVerification;