const Sequelize = require('sequelize');
const path = require('path');
const env = process.env.NODE_ENV || 'production';

const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const db = {};

const sequelize = new Sequelize(

  config.database, config.username, config.password,
  {
    host: config.host,
    dialect: 'mysql',
    timezone: '+09:00',
  }
);
db.sequelize = sequelize;

const Academy = require('./academy');
const Attendance = require('./attendance');
const DeviceToken = require('./deviceToken');
const EmailVerification = require('./emailVerification');
const Parent = require('./parent');
const User = require('./user');
const UserParentRelation = require('./userParentRelation');
const ParentDeviceToken = require('./parentDeviceToken');
const QRToken = require('./qrToken');


db.Academy = Academy;
db.Attendance = Attendance;
db.DeviceToken = DeviceToken;
db.EmailVerification = EmailVerification;
db.Parent = Parent;
db.User = User;
db.UserParentRelation = UserParentRelation;
db.ParentDeviceToken = ParentDeviceToken;
db.QRToken = QRToken;


Academy.initiate(sequelize);
Attendance.initiate(sequelize);
DeviceToken.initiate(sequelize);
EmailVerification.initiate(sequelize);
Parent.initiate(sequelize);
User.initiate(sequelize);
UserParentRelation.initiate(sequelize);
ParentDeviceToken.initiate(sequelize);
QRToken.initiate(sequelize);

Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;