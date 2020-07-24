const express = require('express');
const router = express.Router();

//auth
router.use('/auth', require('./auth'));

//news
router.use('/news', require('./news'));

module.exports = router;
