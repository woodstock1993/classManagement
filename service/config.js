const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'production'}` });

const getConfig = async (req, res) => {
    return res.json({
        host: process.env.HOST,
        protocol: process.env.PROTOCOL,
    });
}

module.exports = { getConfig };