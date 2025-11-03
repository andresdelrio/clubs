const { getConfiguracion, setConfiguracion } = require('../models/configuracionModel');

/**
 * Obtener el estado de las inscripciones (público)
 */
async function getEstadoInscripciones(req, res) {
  try {
    const habilitadas = await getConfiguracion('inscripciones_habilitadas');
    res.json({
      success: true,
      data: {
        habilitadas: habilitadas === 'true',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de inscripciones',
      error: error.message,
    });
  }
}

/**
 * Actualizar el estado de las inscripciones (admin)
 */
async function setEstadoInscripciones(req, res) {
  try {
    const { habilitadas } = req.body;

    if (typeof habilitadas !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo "habilitadas" debe ser un booleano',
      });
    }

    await setConfiguracion('inscripciones_habilitadas', habilitadas ? 'true' : 'false');

    res.json({
      success: true,
      message: `Inscripciones ${habilitadas ? 'habilitadas' : 'deshabilitadas'} correctamente`,
      data: {
        habilitadas,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado de inscripciones',
      error: error.message,
    });
  }
}

module.exports = {
  getEstadoInscripciones,
  setEstadoInscripciones,
};
