const { getPool } = require('../config/database');

async function getAllSedes() {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, nombre, slug FROM sedes ORDER BY nombre ASC'
  );
  return rows;
}

async function getSedeBySlug(slug) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, nombre, slug FROM sedes WHERE slug = ? LIMIT 1',
    [slug]
  );
  return rows[0] || null;
}

async function getSedeById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, nombre, slug FROM sedes WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  getAllSedes,
  getSedeBySlug,
  getSedeById,
};

