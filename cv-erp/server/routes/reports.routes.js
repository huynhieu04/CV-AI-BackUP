// server/routes/reports.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reports.controller');

router.get('/summary', ctrl.getSummary);

module.exports = router;
