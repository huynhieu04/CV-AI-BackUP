const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settings.controller');

// GET /api/settings
router.get('/', ctrl.getSettings);

// PUT /api/settings
router.put('/', ctrl.updateSettings);

module.exports = router;
