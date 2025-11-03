const express = require('express');

const publicRoutes = require('./publicRoutes');
const adminRoutes = require('./adminRoutes');
const reportRoutes = require('./reportRoutes');
const configuracionRoutes = require('./configuracionRoutes');

const router = express.Router();

// Health check endpoint for debugging (remove in production if desired)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasAdminCode: !!process.env.ADMIN_ACCESS_CODE,
      hasDbHost: !!process.env.DB_HOST,
      hasDbName: !!process.env.DB_NAME,
      hasDbUser: !!process.env.DB_USER,
      basePath: process.env.APP_BASE_PATH || 'not set',
    },
  });
});

router.use('/', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/reportes', reportRoutes);
router.use('/configuracion', configuracionRoutes);

module.exports = router;

