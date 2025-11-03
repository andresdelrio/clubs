const { getPool } = require('../config/database');

/**
 * Obtener el valor de una configuración
 * @param {string} clave - La clave de configuración
 * @returns {Promise<string|null>} El valor de la configuración o null si no existe
 */
async function getConfiguracion(clave) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT valor FROM configuracion WHERE clave = ?',
    [clave]
  );
  return rows.length > 0 ? rows[0].valor : null;
}

/**
 * Actualizar el valor de una configuración
 * @param {string} clave - La clave de configuración
 * @param {string} valor - El nuevo valor
 * @returns {Promise<void>}
 */
async function setConfiguracion(clave, valor) {
  const pool = getPool();
  await pool.query(
    'UPDATE configuracion SET valor = ? WHERE clave = ?',
    [valor, clave]
  );
}

/**
 * Verificar si las inscripciones están habilitadas
 * @returns {Promise<boolean>}
 */
async function inscripcionesHabilitadas() {
  const valor = await getConfiguracion('inscripciones_habilitadas');
  return valor === 'true';
}

module.exports = {
  getConfiguracion,
  setConfiguracion,
  inscripcionesHabilitadas,
};
