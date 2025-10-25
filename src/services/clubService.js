const { getPool } = require('../config/database');
const sedeModel = require('../models/sedeModel');
const clubModel = require('../models/clubModel');
const enrollmentModel = require('../models/enrollmentModel');
const { badRequest, notFound, conflict } = require('../utils/errors');

async function listSedes() {
  return sedeModel.getAllSedes();
}

async function listClubsBySedeSlug(slug) {
  const sede = await sedeModel.getSedeBySlug(slug);
  if (!sede) {
    throw notFound('Sede no encontrada');
  }
  const clubs = await clubModel.getClubsBySedeId(sede.id);
  return { sede, clubs };
}

async function getClubDetails(id) {
  const club = await clubModel.getClubById(id);
  if (!club) {
    throw notFound('Club no encontrado');
  }
  return club;
}

async function createClub({ sedeSlug, nombre, descripcion, responsable, capacidad, imagenUrl }) {
  if (!sedeSlug || !nombre || capacidad === undefined) {
    throw badRequest('Sede, nombre y capacidad son obligatorios');
  }

  if (!responsable) {
    throw badRequest('El responsable es obligatorio');
  }

  const sede = await sedeModel.getSedeBySlug(sedeSlug);
  if (!sede) {
    throw notFound('Sede no encontrada');
  }

  if (Number.isNaN(Number(capacidad)) || Number(capacidad) < 0) {
    throw badRequest('Capacidad inválida');
  }

  const data = {
    sedeId: sede.id,
    nombre,
    descripcion: descripcion || '',
    responsable: responsable || '',
    capacidad: Number(capacidad),
    imagenUrl: imagenUrl || '',
  };

  return clubModel.createClub(data);
}

async function updateClub(id, { nombre, descripcion, responsable, capacidad, imagenUrl }) {
  const current = await clubModel.getClubById(id);
  if (!current) {
    throw notFound('Club no encontrado');
  }

  if (!nombre || Number.isNaN(Number(capacidad)) || Number(capacidad) < 0) {
    throw badRequest('Nombre y capacidad válidos son obligatorios');
  }

  if (!responsable) {
    throw badRequest('El responsable es obligatorio');
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const ocupados = await enrollmentModel.countActiveEnrollmentsByClub(connection, id);
    if (ocupados > Number(capacidad)) {
      throw conflict(
        'La capacidad no puede ser menor al número de estudiantes ya inscritos'
      );
    }

    await clubModel.updateClub(
      id,
      {
        nombre,
        descripcion: descripcion || '',
        responsable: responsable || '',
        capacidad: Number(capacidad),
        imagenUrl: imagenUrl || '',
      },
      connection
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return clubModel.getClubById(id);
}

async function deleteClub(id) {
  const current = await clubModel.getClubById(id);
  if (!current) {
    throw notFound('Club no encontrado');
  }

  if (current.inscritos > 0) {
    throw conflict('No se puede eliminar un club con inscripciones activas');
  }

  await clubModel.deleteClub(id);
}

module.exports = {
  listSedes,
  listClubsBySedeSlug,
  getClubDetails,
  createClub,
  updateClub,
  deleteClub,
};
