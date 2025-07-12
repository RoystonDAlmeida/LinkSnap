const express = require('express');
const router = express.Router();

// Import handlers for the respective routes
const { shortenUrl } = require('../controllers/shortenController');
const { updateLinkStatus } = require('../controllers/linkSettingsController');
const { getQRCode } = require('../controllers/qrController');

// Import authenticate middleware for verifying user
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, shortenUrl);
router.patch('/:id/status', authenticate, updateLinkStatus);
router.get('/:id/qrcode', authenticate, getQRCode);

module.exports = router; 