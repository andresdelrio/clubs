const { getPool } = require('../config/database');
const { ENROLLMENT_STATE } = require('../utils/constants');

async function countActiveEnrollmentsByClub(connection, clubId) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM inscripciones
     WHERE club_id = ? AND estado = ?`,
    [clubId, ENROLLMENT_STATE.ACTIVO]
  );
  return rows[0]?.total || 0;
}

async function findActiveEnrollmentByDocument(documento) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
        i.id AS enrollmentId,
        i.estudiante_id AS estudianteId,
        i.club_id AS clubId,
        i.estado,
        i.creado_en AS creadoEn,
        e.nombre AS estudianteNombre,
        e.documento AS estudianteDocumento,
        e.grupo AS estudianteGrupo,
        e.sede_id AS sedeId,
        c.nombre AS clubNombre,
        c.descripcion AS clubDescripcion,
        c.responsable AS clubResponsable,
        c.capacidad AS clubCapacidad,
        c.imagen_url AS clubImagenUrl,
        c.sede_id AS clubSedeId,
        sed.nombre AS sedeNombre,
        sed.slug AS sedeSlug
     FROM inscripciones i
     INNER JOIN estudiantes e ON e.id = i.estudiante_id
     INNER JOIN clubs c ON c.id = i.club_id
     INNER JOIN sedes sed ON sed.id = c.sede_id
     WHERE e.documento = ? AND i.estado = ?
     LIMIT 1`,
    [documento, ENROLLMENT_STATE.ACTIVO]
  );
  return rows[0] || null;
}

async function getActiveEnrollmentByStudentId(connection, studentId) {
  const [rows] = await connection.query(
    `SELECT id, estudiante_id AS estudianteId, club_id AS clubId, estado, creado_en AS creadoEn
     FROM inscripciones
     WHERE estudiante_id = ? AND estado = ?
     LIMIT 1`,
    [studentId, ENROLLMENT_STATE.ACTIVO]
  );
  return rows[0] || null;
}

async function createEnrollment(connection, { estudianteId, clubId }) {
  const [result] = await connection.query(
    `INSERT INTO inscripciones (estudiante_id, club_id, estado)
     VALUES (:estudianteId, :clubId, :estado)`,
    {
      estudianteId,
      clubId,
      estado: ENROLLMENT_STATE.ACTIVO,
    }
  );
  return result.insertId;
}

async function cancelEnrollment(connection, enrollmentId) {
  await connection.query(
    `UPDATE inscripciones
     SET estado = :estado, actualizado_en = NOW()
     WHERE id = :id`,
    {
      id: enrollmentId,
      estado: ENROLLMENT_STATE.CANCELADO,
    }
  );
}

async function getEnrollmentWithDetails(enrollmentId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
        i.id,
        i.estudiante_id AS estudianteId,
        i.club_id AS clubId,
        i.estado,
        i.creado_en AS creadoEn,
        e.nombre AS estudianteNombre,
        e.documento AS estudianteDocumento,
        e.grupo AS estudianteGrupo,
        e.sede_id AS sedeId,
        c.nombre AS clubNombre,
        c.sede_id AS clubSedeId
     FROM inscripciones i
     INNER JOIN estudiantes e ON e.id = i.estudiante_id
     INNER JOIN clubs c ON c.id = i.club_id
     WHERE i.id = ?`,
    [enrollmentId]
  );
  return rows[0] || null;
}

async function listEnrollments({ sedeId, grupo, clubId }) {
  const pool = getPool();
  const conditions = ['i.estado = :estado'];
  const params = {
    estado: ENROLLMENT_STATE.ACTIVO,
  };

  if (sedeId) {
    conditions.push('c.sede_id = :sedeId');
    params.sedeId = sedeId;
  }
  if (grupo) {
    conditions.push('e.grupo = :grupo');
    params.grupo = grupo;
  }
  if (clubId) {
    conditions.push('i.club_id = :clubId');
    params.clubId = clubId;
  }

  const where = `WHERE ${conditions.join(' AND ')}`;
  const [rows] = await pool.query(
    `SELECT 
        i.id AS enrollmentId,
        e.nombre AS estudianteNombre,
        e.documento AS estudianteDocumento,
        e.grupo AS estudianteGrupo,
        e.sede_id AS sedeId,
        c.id AS clubId,
        c.nombre AS clubNombre,
        c.responsable AS clubResponsable,
        c.capacidad AS clubCapacidad,
        sed.nombre AS sedeNombre,
        sed.slug AS sedeSlug
     FROM inscripciones i
     INNER JOIN estudiantes e ON e.id = i.estudiante_id
     INNER JOIN clubs c ON c.id = i.club_id
     INNER JOIN sedes sed ON sed.id = c.sede_id
     ${where}
     ORDER BY sed.nombre, c.nombre, e.nombre`,
    params
  );
  return rows;
}

module.exports = {
  countActiveEnrollmentsByClub,
  findActiveEnrollmentByDocument,
  getActiveEnrollmentByStudentId,
  createEnrollment,
  cancelEnrollment,
  getEnrollmentWithDetails,
  listEnrollments,
};
