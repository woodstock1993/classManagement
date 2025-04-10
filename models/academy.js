const crypto = require('crypto');
const Sequelize = require('sequelize');

class Academy extends Sequelize.Model {
    static initiate(sequelize) {
        Academy.init({
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
            },
            code: {
                type: Sequelize.STRING(6),
                allowNull: false,
                unique: true,
            }            
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Academy',
            tableName: 'academies',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
            hooks: { 
                beforeCreate: async (academy) => {
                    academy.code = await generateUniqueCode(sequelize);
                }
            }            
        });
    }

    static associate(db) {
        Academy.hasMany(db.User, { foreignKey: 'academyId', onDelete: 'SET NULL' })
    }
}

// 고유 코드 생성 함수 (6자리 영문 대문자 + 숫자)
const generateUniqueCode = async (sequelize) => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동 방지 문자셋
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = '';
        const bytes = crypto.randomBytes(4); // 4바이트 = 8자리 16진수
        for (let i = 0; i < 6; i++) {
            code += characters[bytes.readUInt8(i % 4) % characters.length];
        }
                
        const existingAcademy = await sequelize.models.Academy.findOne({ 
            where: { code } 
        });
        if (!existingAcademy) isUnique = true;
    }
    return code;
};

module.exports = Academy;
