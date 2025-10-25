const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

router.get('/ping', requireAdmin, adminController.ping);

router.post('/clubs', requireAdmin, adminController.createClub);
router.put('/clubs/:clubId', requireAdmin, adminController.updateClub);
router.delete('/clubs/:clubId', requireAdmin, adminController.deleteClub);

router.get('/estudiantes', requireAdmin, adminController.listStudents);

router.post('/inscripciones', requireAdmin, adminController.assignEnrollment);
router.patch(
  '/inscripciones/:enrollmentId/mover',
  requireAdmin,
  adminController.moveEnrollment
);
router.delete(
  '/inscripciones/:enrollmentId',
  requireAdmin,
  adminController.removeEnrollment
);

router.post(
  '/estudiantes/importar',
  requireAdmin,
  (req, res, next) => {
    const upload = req.upload.single('archivo');
    upload(req, res, (err) => {
      if (err) {
        return next(err);
      }
      return adminController.importStudents(req, res, next);
    });
  }
);

module.exports = router;
