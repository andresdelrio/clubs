const express = require('express');
const publicController = require('../controllers/publicController');

const router = express.Router();

router.get('/sedes', publicController.getSedes);
router.get('/sedes/:sedeSlug/clubs', publicController.getClubsBySede);
router.get('/clubs/:clubId', publicController.getClub);
router.post('/inscripciones', publicController.createEnrollment);
router.post('/inscripciones/consulta', publicController.checkEnrollment);

module.exports = router;
