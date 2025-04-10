// 필수 모듈 불러오기
const config = require('./config/config');
const cors = require('cors');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// 라우터 불러오기
const academyRouter = require('./routers/academyRoutes');
const authRouter = require('./routers/authRoutes');
const configRouter = require('./routers/configRoutes');
const notificationRouter = require('./routers/notificationRoutes');
const parentRouter = require('./routers/parentRoutes');
const qrRouter = require('./routers/qrRoutes');
const userRouter = require('./routers/userRoutes');
const v1 = require('./routers/v1');

// 환경변수 설정
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'production'}` });

// Passport 설정
const passportConfig = require('./passport/');

// 데이터베이스 연결
const { sequelize } = require('./models');

// Express 애플리케이션 초기화
const app = express();
passportConfig();

// 서버 포트 설정
const port = process.env.PORT || 8080;
app.set('port', port);
app.set('view engine', 'html');

// Nunjucks 템플릿 엔진 설정
nunjucks.configure('views', {
    express: app,
    watch: true,
});

// Passport 초기화 및 세션 설정(세션 뒤에 설정)
app.use(passport.initialize());

// Sequelize로 데이터베이스 동기화
sequelize.sync({ force: false })
    .then(() => {
        console.log('Database Connection Success');
    })
    .catch((err) => {
        console.error(err);
    });

// 미들웨어 설정
// 서버에서 CORS 설정 예시
app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan(process.env.MORGAN_CONFIG)); // 요청 로그를 콘솔에 출력
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 서빙
app.use(express.json()); // JSON 바디 파싱
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 파서

// 라우터 설정
app.use('/academy', academyRouter);
app.use('/auth', authRouter);
app.use('/config', configRouter);
app.use('/qr', qrRouter);
app.use('/notification', notificationRouter);
app.use('/parent', parentRouter);
app.use('/user', userRouter);
app.use('/v1', v1);

// Swagger 문서화 설정
const { swaggerUi, specs } = require("./swagger/swagger");
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('서버 오류가 발생했습니다.');
});

// 서버 시작
app.listen(port, '0.0.0.0', () => {
    const protocol = config.PROTOCOL;
    const host = config.HOST;
    console.log(`Server Listening: ${protocol}://${host}`);
});
