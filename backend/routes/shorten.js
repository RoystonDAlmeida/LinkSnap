const express = require('express');
const router = express.Router();
const { shortenUrl } = require('../controllers/shortenController');
const { updateLinkStatus } = require('../controllers/linkSettingsController');
const authenticate = require('../middleware/authenticate');

router.post('/', authenticate, shortenUrl);
router.patch('/:id/status', authenticate, updateLinkStatus);

module.exports = router; 