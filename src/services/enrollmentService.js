const { getPool } = require('../config/database');
const clubModel = require('../models/clubModel');
const enrollmentModel = require('../models/enrollmentModel');
const studentModel = require('../models/studentModel');
const sedeModel = require('../models/sedeModel');
const { ENROLLMENT_STATE } = require('../utils/constants');
const { badRequest, notFound, conflict } = require('../utils/errors');

async function ensureClubAvailable(clubId) {
  const club = await clubModel.getClubById(clubId);
  if (!club) {
    throw notFound('Club no encontrado');
  }
  return club;
}

async function registerEnrollment({ documento, clubId }) {
  const normalizedDocumento = documento ? documento.trim().toUpperCase() : '';

  if (!normalizedDocumento || !clubId) {
    throw badRequest('Documento y club son obligatorios');
  }

  const club = await ensureClubAvailable(clubId);

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const student = await studentModel.findStudentByDocument(normalizedDocumento);
    if (!student) {
      throw notFound('Estudiante no habilitado');
    }
    if (student.sedeId !== club.sedeId) {
      throw conflict('La sede del estudiante no coincide con el club seleccionado');
    }

    const existing = await enrollmentModel.getActiveEnrollmentByStudentId(connection, student.id);
    if (existing) {
      throw conflict('El estudiante ya se encuentra inscrito en un club');
    }

    const ocupados = await enrollmentModel.countActiveEnrollmentsByClub(connection, clubId);
    if (ocupados >= club.capacidad) {
      throw conflict('El club ya alcanzó el cupo máximo');
    }

    const enrollmentId = await enrollmentModel.createEnrollment(connection, {
      estudianteId: student.id,
      clubId,
    });

    await connection.commit();

    return enrollmentModel.getEnrollmentWithDetails(enrollmentId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function adminAssignEnrollment({ documento, clubId }) {
  return registerEnrollment({ documento, clubId });
}

async function checkEnrollmentStatus(documento) {
  const normalized = documento ? documento.trim().toUpperCase() : '';
  if (!normalized) {
    throw badRequest('Documento obligatorio');
  }

  const record = await enrollmentModel.findActiveEnrollmentByDocument(normalized);
  if (!record) {
    return { inscrito: false };
  }

  return {
    inscrito: true,
    estudiante: {
      nombre: record.estudianteNombre,
      documento: record.estudianteDocumento,
      grupo: record.estudianteGrupo,
    },
    sede: {
      id: record.sedeId,
      nombre: record.sedeNombre,
      slug: record.sedeSlug,
    },
    club: {
      id: record.clubId,
      nombre: record.clubNombre,
      descripcion: record.clubDescripcion,
      responsable: record.clubResponsable,
      capacidad: record.clubCapacidad,
      imagenUrl: record.clubImagenUrl,
    },
  };
}

async function cancelEnrollment(enrollmentId) {
  const enrollment = await enrollmentModel.getEnrollmentWithDetails(enrollmentId);
  if (!enrollment) {
    throw notFound('Inscripción no encontrada');
  }

  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await enrollmentModel.cancelEnrollment(connection, enrollmentId);
    await connection.commit();
    return { ...enrollment, estado: ENROLLMENT_STATE.CANCELADO };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function moveEnrollment(enrollmentId, nuevoClubId) {
  const clubIdNumber = Number(nuevoClubId);
  if (!clubIdNumber) {
    throw badRequest('Debe seleccionar el nuevo club');
  }

  const enrollment = await enrollmentModel.getEnrollmentWithDetails(enrollmentId);
  if (!enrollment) {
    throw notFound('Inscripción no encontrada');
  }

  if (enrollment.clubId === clubIdNumber) {
    throw conflict('La inscripción ya pertenece a este club');
  }

  const nuevoClub = await ensureClubAvailable(clubIdNumber);
  if (nuevoClub.sedeId !== enrollment.sedeId) {
    throw conflict('Solo se puede mover a clubs de la misma sede');
  }

  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const ocupados = await enrollmentModel.countActiveEnrollmentsByClub(connection, clubIdNumber);
    if (ocupados >= nuevoClub.capacidad) {
      throw conflict('El nuevo club ya alcanzó el cupo máximo');
    }

    await enrollmentModel.cancelEnrollment(connection, enrollmentId);

    const nuevoId = await enrollmentModel.createEnrollment(connection, {
      estudianteId: enrollment.estudianteId,
      clubId: clubIdNumber,
    });

    await connection.commit();

    return enrollmentModel.getEnrollmentWithDetails(nuevoId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getReport(filters) {
  let sedeId;
  let sedeInfo;
  if (filters.sedeSlug) {
    const sede = await sedeModel.getSedeBySlug(filters.sedeSlug);
    if (!sede) {
      throw notFound('Sede no encontrada');
    }
    sedeId = sede.id;
    sedeInfo = sede;
  }

  const results = await enrollmentModel.listEnrollments({
    sedeId,
    grupo: filters.grupo || undefined,
    clubId: filters.clubId ? Number(filters.clubId) : undefined,
  });

  let clubsBase;
  if (filters.clubId) {
    const club = await clubModel.getClubById(Number(filters.clubId));
    clubsBase = club ? [club] : [];
  } else if (sedeId) {
    clubsBase = await clubModel.getClubsBySedeId(sedeId);
  } else {
    clubsBase = await clubModel.getAllClubs();
  }

  const map = new Map();

  clubsBase.forEach((club) => {
    map.set(club.id, {
      clubId: club.id,
      clubNombre: club.nombre,
      clubDescripcion: club.descripcion,
      clubResponsable: club.responsable,
      capacidad: club.capacidad,
      sedeId: club.sedeId,
      sedeNombre: club.sedeNombre,
      sedeSlug: club.sedeSlug,
      cuposDisponibles: club.cuposDisponibles,
      cuposOcupados: 0,
      estudiantes: [],
    });
  });

  results.forEach((row) => {
    const entry = map.get(row.clubId) || {
      clubId: row.clubId,
      clubNombre: row.clubNombre,
      clubDescripcion: '',
      clubResponsable: row.clubResponsable,
      capacidad: row.clubCapacidad,
      sedeId: row.sedeId,
      sedeNombre: row.sedeNombre,
      sedeSlug: row.sedeSlug,
      cuposDisponibles: null,
      cuposOcupados: 0,
      estudiantes: [],
    };

    entry.estudiantes.push({
      enrollmentId: row.enrollmentId,
      nombre: row.estudianteNombre,
      documento: row.estudianteDocumento,
      grupo: row.estudianteGrupo,
    });
    entry.cuposOcupados = entry.estudiantes.length;
    if (entry.capacidad !== null && entry.capacidad !== undefined) {
      entry.cuposDisponibles = Math.max(entry.capacidad - entry.cuposOcupados, 0);
    }
    map.set(row.clubId, entry);
  });

  const clubsArray = Array.from(map.values()).sort((a, b) => {
    if (a.sedeNombre === b.sedeNombre) {
      return a.clubNombre.localeCompare(b.clubNombre);
    }
    return a.sedeNombre.localeCompare(b.sedeNombre);
  });

  return {
    filtros: {
      sede: sedeInfo || null,
      grupo: filters.grupo || null,
      clubId: filters.clubId ? Number(filters.clubId) : null,
    },
    clubs: clubsArray,
  };
}

module.exports = {
  registerEnrollment,
  adminAssignEnrollment,
  checkEnrollmentStatus,
  cancelEnrollment,
  moveEnrollment,
  getReport,
};
