const express = require('express');
const router = express.Router();
const { getAllLinksAnalytics, getLinkAnalytics } = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, getAllLinksAnalytics);
router.get('/:id', authenticate, getLinkAnalytics);

module.exports = router; 