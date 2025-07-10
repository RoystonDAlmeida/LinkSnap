const express = require('express');
const router = express.Router();
const { handleRedirect } = require('../controllers/redirectController');

router.get('/:id', handleRedirect);

module.exports = router; 