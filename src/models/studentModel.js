const { getPool } = require('../config/database');

async function findStudentByDocument(documento) {
  const normalized = documento ? documento.trim().toUpperCase() : '';
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, sede_id AS sedeId, grupo, nombre, documento, creado_en AS creadoEn
     FROM estudiantes
     WHERE documento = ?
     LIMIT 1`,
    [normalized]
  );
  return rows[0] || null;
}

async function createStudent(connection, student) {
  const [result] = await connection.query(
    `INSERT INTO estudiantes (sede_id, grupo, nombre, documento)
     VALUES (:sedeId, :grupo, :nombre, :documento)`,
    {
      sedeId: student.sedeId,
      grupo: student.grupo,
      nombre: student.nombre,
      documento: student.documento.trim().toUpperCase(),
    }
  );
  return result.insertId;
}

async function ensureStudent(connection, student) {
  // Attempt insert; if duplicate, return null indicating existing
  try {
    const insertId = await createStudent(connection, student);
    return { insertId, created: true };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      const existing = await findStudentByDocument(student.documento);
      return { insertId: existing?.id, created: false };
    }
    throw err;
  }
}

async function getStudents({ sedeId, grupo, search } = {}) {
  const pool = getPool();
  const conditions = [];
  const params = {};

  if (sedeId) {
    conditions.push('sede_id = :sedeId');
    params.sedeId = sedeId;
  }
  if (grupo) {
    conditions.push('grupo = :grupo');
    params.grupo = grupo;
  }
  if (search) {
    conditions.push('(nombre LIKE :search OR documento LIKE :search)');
    params.search = `%${search}%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT id, sede_id AS sedeId, grupo, nombre, documento
     FROM estudiantes
     ${where}
     ORDER BY nombre ASC`,
    params
  );
  return rows;
}

module.exports = {
  findStudentByDocument,
  ensureStudent,
  getStudents,
};
