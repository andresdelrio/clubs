const express = require('express');

const publicRoutes = require('./publicRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/reportes', reportRoutes);

module.exports = router;

