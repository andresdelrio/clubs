const express = require('express');
const { getEstadoInscripciones, setEstadoInscripciones } = require('../controllers/configuracionController');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Ruta pública para consultar estado de inscripciones
router.get('/inscripciones-habilitadas', getEstadoInscripciones);

// Ruta admin para actualizar estado de inscripciones
router.patch('/inscripciones', requireAdmin, setEstadoInscripciones);

module.exports = router;
