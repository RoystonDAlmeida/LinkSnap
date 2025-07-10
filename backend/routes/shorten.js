const express = require('express');
const router = express.Router();
const { shortenUrl } = require('../controllers/shortenController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, shortenUrl);

module.exports = router; 