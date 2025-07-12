const express = require('express');
const router = express.Router();
const { handleRedirect } = require('../controllers/redirectController');

router.get('/:id', handleRedirect);
router.post('/:id', handleRedirect);    // Redirect to URL after submitting password

module.exports = router; 