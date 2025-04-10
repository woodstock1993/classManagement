const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'email.js'));
const moment = require('moment');
moment.tz.setDefault("Asia/Seoul");

const transporter = config.smtpTransport;
const EmailVerification = require('../models/emailVerification');

const sendVerificationCode = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: '이메일을 입력하세요.' });
    }
    const authCode = Math.random().toString(36).substring(2, 8);
    const requestedAt = moment().toDate();
    const expiresAt = moment().add(5, 'minutes').toDate();
    
    const emailVerification = await EmailVerification.create({
        email: email,
        token: authCode,
        verified: false,
        requestedAt: requestedAt,
        expiresAt: expiresAt,
    });

    if (!emailVerification) {
        return res.status(500).json({ error: 'Failed to create EmailVerification'});
    }

    // 텍스트 형태의 이메일 내용
    const textMessage = `인증문자는 ${authCode} 입니다.`;

    // HTML 형태의 이메일 내용
    const htmlMessage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>이메일 인증</title>
      </head>
      <body>
          <div> 인증문자는 <strong>${authCode}</strong> 입니다. </div>
      </body>
      </html>
    `;

    const mailOptions = {
        from: transporter.options.auth.user,
        to: email,
        subject: '이메일 인증',
        text: textMessage, // 순수 텍스트 이메일 내용
        html: htmlMessage, // HTML 이메일 내용
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: '이메일이 성공적으로 발송되었습니다.' });
    } catch (error) {
        console.error('이메일 전송 오류:', error);
        return res.status(500).json({ success: false, message: '이메일 전송에 실패했습니다.' });
    }
};

module.exports = { sendVerificationCode };
