const clubService = require('../services/clubService');
const studentService = require('../services/studentService');
const enrollmentService = require('../services/enrollmentService');
const sedeModel = require('../models/sedeModel');

function ping(_req, res) {
  res.json({ success: true });
}

async function createClub(req, res, next) {
  try {
    const club = await clubService.createClub(req.body);
    res.status(201).json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
}

async function updateClub(req, res, next) {
  try {
    const { clubId } = req.params;
    const club = await clubService.updateClub(Number(clubId), req.body);
    res.json({ success: true, data: club });
  } catch (error) {
    next(error);
  }
}

async function deleteClub(req, res, next) {
  try {
    const { clubId } = req.params;
    await clubService.deleteClub(Number(clubId));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function importStudents(req, res, next) {
  if (!req.file?.path) {
    return res.status(400).json({
      success: false,
      message: 'Debe adjuntar un archivo CSV',
    });
  }

  try {
    const result = await studentService.importStudentsCsv(req.file.path);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function listStudents(req, res, next) {
  try {
    const { sedeSlug, grupo, search } = req.query;
    let sedeId;
    if (sedeSlug) {
      const sede = await sedeModel.getSedeBySlug(sedeSlug);
      if (!sede) {
        return res.status(404).json({
          success: false,
          message: 'Sede no encontrada',
        });
      }
      sedeId = sede.id;
    }
    const students = await studentService.listStudents({
      sedeId,
      grupo,
      search,
    });
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
}

async function assignEnrollment(req, res, next) {
  try {
    const { documento, clubId } = req.body;
    const enrollment = await enrollmentService.adminAssignEnrollment({
      documento,
      clubId: Number(clubId),
    });
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
}

async function moveEnrollment(req, res, next) {
  try {
    const { enrollmentId } = req.params;
    const { nuevoClubId } = req.body;
    const result = await enrollmentService.moveEnrollment(
      Number(enrollmentId),
      nuevoClubId
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function removeEnrollment(req, res, next) {
  try {
    const { enrollmentId } = req.params;
    const result = await enrollmentService.cancelEnrollment(Number(enrollmentId));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ping,
  createClub,
  updateClub,
  deleteClub,
  importStudents,
  listStudents,
  assignEnrollment,
  moveEnrollment,
  removeEnrollment,
};
