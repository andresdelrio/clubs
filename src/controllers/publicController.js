const clubService = require('../services/clubService');
const enrollmentService = require('../services/enrollmentService');
const { inscripcionesHabilitadas } = require('../models/configuracionModel');
const { badRequest } = require('../utils/errors');

async function getSedes(req, res, next) {
  try {
    const sedes = await clubService.listSedes();
    res.json({ success: true, data: sedes });
  } catch (error) {
    next(error);
  }
}

async function getClubsBySede(req, res, next) {
  try {
    const { sedeSlug } = req.params;
    const result = await clubService.listClubsBySedeSlug(sedeSlug);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getClub(req, res, next) {
  try {
    const { clubId } = req.params;
    const club = await clubService.getClubDetails(Number(clubId));
    res.json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
}

async function createEnrollment(req, res, next) {
  try {
    // Verificar si las inscripciones están habilitadas
    const habilitadas = await inscripcionesHabilitadas();
    if (!habilitadas) {
      return res.status(403).json({
        success: false,
        message: 'Las inscripciones están cerradas temporalmente',
      });
    }

    const { documento, clubId, aceptaAdvertencia } = req.body;

    if (aceptaAdvertencia !== true && aceptaAdvertencia !== 'true') {
      throw badRequest(
        'Debe aceptar la advertencia antes de completar la inscripción'
      );
    }

    const enrollment = await enrollmentService.registerEnrollment({
      documento,
      clubId: Number(clubId),
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
}

async function checkEnrollment(req, res, next) {
  try {
    const { documento } = req.body;
    const result = await enrollmentService.checkEnrollmentStatus(documento);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSedes,
  getClubsBySede,
  getClub,
  createEnrollment,
  checkEnrollment,
};
