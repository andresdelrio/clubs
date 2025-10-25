const express = require('express');
const reportController = require('../controllers/reportController');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/inscripciones', requireAdmin, reportController.getReport);

module.exports = router;
