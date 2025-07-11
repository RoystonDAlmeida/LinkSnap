const express = require('express');
const router = express.Router();
const { getAllLinksAnalytics, getLinkAnalytics } = require('../controllers/analyticsController');
const { getUserGeodataByLink } = require('../controllers/geodataController');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, getAllLinksAnalytics);
router.get('/:id', authenticate, getLinkAnalytics);
router.get('/geodata-by-link', authenticate, getUserGeodataByLink);

module.exports = router; 