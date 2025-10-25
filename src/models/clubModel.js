const { getPool } = require('../config/database');
const { ENROLLMENT_STATE } = require('../utils/constants');

async function getClubsBySedeId(sedeId) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      c.id,
      c.nombre,
      c.descripcion,
      c.responsable,
      c.capacidad,
      c.imagen_url AS imagenUrl,
      c.sede_id AS sedeId,
      s.nombre AS sedeNombre,
      s.slug AS sedeSlug,
      c.creado_en AS createdAt,
      c.updated_at AS updatedAt,
      IFNULL(count(i.id), 0) AS inscritos,
      GREATEST(c.capacidad - IFNULL(count(i.id), 0), 0) AS cuposDisponibles
    FROM clubs c
    INNER JOIN sedes s ON s.id = c.sede_id
    LEFT JOIN inscripciones i ON i.club_id = c.id AND i.estado = ?
    WHERE c.sede_id = ?
    GROUP BY c.id
    ORDER BY c.nombre ASC`,
    [ENROLLMENT_STATE.ACTIVO, sedeId]
  );
  return rows;
}

async function getAllClubs() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      c.id,
      c.nombre,
      c.descripcion,
      c.responsable,
      c.capacidad,
      c.imagen_url AS imagenUrl,
      c.sede_id AS sedeId,
      s.nombre AS sedeNombre,
      s.slug AS sedeSlug,
      c.creado_en AS createdAt,
      c.updated_at AS updatedAt,
      IFNULL(count(i.id), 0) AS inscritos,
      GREATEST(c.capacidad - IFNULL(count(i.id), 0), 0) AS cuposDisponibles
    FROM clubs c
    INNER JOIN sedes s ON s.id = c.sede_id
    LEFT JOIN inscripciones i ON i.club_id = c.id AND i.estado = ?
    GROUP BY c.id
    ORDER BY s.nombre ASC, c.nombre ASC`,
    [ENROLLMENT_STATE.ACTIVO]
  );
  return rows;
}

async function getClubById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      c.id,
      c.nombre,
      c.descripcion,
      c.responsable,
      c.capacidad,
      c.imagen_url AS imagenUrl,
      c.sede_id AS sedeId,
      s.nombre AS sedeNombre,
      s.slug AS sedeSlug,
      c.creado_en AS createdAt,
      c.updated_at AS updatedAt,
      IFNULL(count(i.id), 0) AS inscritos,
      GREATEST(c.capacidad - IFNULL(count(i.id), 0), 0) AS cuposDisponibles
    FROM clubs c
    INNER JOIN sedes s ON s.id = c.sede_id
    LEFT JOIN inscripciones i ON i.club_id = c.id AND i.estado = ?
    WHERE c.id = ?
    GROUP BY c.id
    LIMIT 1`,
    [ENROLLMENT_STATE.ACTIVO, id]
  );
  return rows[0] || null;
}

async function createClub(data) {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO clubs (sede_id, nombre, descripcion, responsable, capacidad, imagen_url)
     VALUES (:sedeId, :nombre, :descripcion, :responsable, :capacidad, :imagenUrl)`,
    {
      sedeId: data.sedeId,
      nombre: data.nombre,
      descripcion: data.descripcion,
      responsable: data.responsable,
      capacidad: data.capacidad,
      imagenUrl: data.imagenUrl,
    }
  );
  return getClubById(result.insertId);
}

async function updateClub(id, data, connection = null) {
  const executor = connection || getPool();
  await executor.query(
    `UPDATE clubs 
     SET nombre = :nombre,
         descripcion = :descripcion,
         responsable = :responsable,
         capacidad = :capacidad,
         imagen_url = :imagenUrl,
         updated_at = NOW()
     WHERE id = :id`,
    {
      id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      responsable: data.responsable,
      capacidad: data.capacidad,
      imagenUrl: data.imagenUrl,
    }
  );
  return getClubById(id);
}

async function deleteClub(id) {
  const pool = getPool();
  await pool.query('DELETE FROM clubs WHERE id = ?', [id]);
}

module.exports = {
  getClubsBySedeId,
  getAllClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
};
