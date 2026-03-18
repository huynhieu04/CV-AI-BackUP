// server/routes/candidates.routes.js
const express = require('express');
const router = express.Router();
const candidatesController = require('../controllers/candidate.controller');

router.get('/', candidatesController.getAll);
router.get('/:id', candidatesController.getOne);
router.delete('/:id', candidatesController.remove);

module.exports = router;
