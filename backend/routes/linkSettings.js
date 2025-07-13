const express = require('express');
const router = express.Router();

const { updateLinkExpiryAndPassword } = require('../controllers/updateLinkExpiryAndPasswordController');
const { updateLinkStatus } = require('../controllers/linkSettingsController');
const { getQRCode } = require('../controllers/qrController');
const authenticate = require('../middleware/authenticate');

// PATCH /api/links/:id/settings - update expiry date and password
router.patch('/:id/settings', authenticate, updateLinkExpiryAndPassword);

// PATCH /api/links/:id/status - update link status (active/disabled)
router.patch('/:id/status', authenticate, updateLinkStatus);

// GET /api/links/:id/qrcode - get QR code for a link
router.get('/:id/qrcode', authenticate, getQRCode);

module.exports = router; 