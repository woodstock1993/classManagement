const crypto = require('crypto');
const { Op } = require('sequelize');
const QRCode = require('qrcode');
const QRToken = require('../models/qrToken');
const config = require('../config/config');

const moment = require('moment');
moment.tz.setDefault("Asia/Seoul");

exports.createQRCode = async (req, res) => {
    const today = moment().startOf('day');
    const endOfToday = moment().endOf('day');
    const tomorrow = moment(today).add(1, 'days');

    const existingQRCode = await QRToken.findOne({
        where: {
            createdAt: {
                [Op.gte]: today.toDate(),
            },
            expiresAt: {
                [Op.lt]: tomorrow.toDate(),
            }
        }
    })

    if (existingQRCode !== null) {
        return res.status(200).json(existingQRCode);
    }

    const nonce = crypto.randomBytes(16).toString('hex');

    const qrToken = await QRToken.create({
        nonce: nonce,
        expiresAt: endOfToday.toDate()
    });
    return res.status(201).json(qrToken);
};

exports.getTodayQRCode = async (req, res) => {
    try {
        const today = moment().startOf('day');
        const tomorrow = moment(today).add(1, 'days');

        const qrCode = await QRToken.findOne({
            where: {
                createdAt: {
                    [Op.gte]: today.toDate(),
                },
                expiresAt: {
                    [Op.lt]: tomorrow.toDate(),
                }
            }
        });
        if (qrCode) {
            return qrCode;
        }
    } catch (error) {
        console.error(error);
        return error;
    }
};

exports.generateQRImage = async (req, res, next) => {
    const qrData = await this.getTodayQRCode();

    if (!qrData) {
        return res.status(404).json({ message: 'QR code not exist' });
    }

    const targetUrl = `${config.PROTOCOL}://${config.HOST}/qr/scan?token=${qrData.nonce}`;
    
    const qrImage = await QRCode.toBuffer(targetUrl);
    res.type('png');
    res.send(qrImage);
}
