const express = require('express');
const router = express.Router();

// Import handlers for the respective routes
const { shortenUrl } = require('../controllers/shortenController');

// Import authenticate middleware for verifying user
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, shortenUrl);

module.exports = router; 