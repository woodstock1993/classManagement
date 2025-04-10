const express = require('express');
const router = express.Router();
const { getConfig } = require('../service/config');

router.get('/', getConfig);

module.exports = router;