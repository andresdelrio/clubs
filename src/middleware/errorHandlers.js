function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
  });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    details: err.details || undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};

