const nodemailer = require("nodemailer");

const smtpTransport = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    service: process.env.MAILSERVICE,
    host: process.env.HOSTMAIL,
    port: process.env.MAILPORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_USER_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

module.exports = {
    smtpTransport,
};