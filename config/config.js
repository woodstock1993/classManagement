require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'production'}` });

const config = {
    BASE_URL: process.env.BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    HOST: process.env.HOST,
    PROTOCOL: process.env.PROTOCOL,
    KAKAO: {
        CLIENT_ID: process.env.KAKAO_ID,
        CALLBACK_URL: process.env.KAKAO_CALLBACK_URL
    },
    GOOGLE: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL
    },
    FIREBASE: {
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.measurementId,
        measurementId: process.env.measurementId,
        vapidKey: process.env.vapidKey
    }
};

module.exports = config