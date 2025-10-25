class AppError extends Error {
  constructor(message, status = 500, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function badRequest(message, details) {
  return new AppError(message, 400, details);
}

function notFound(message, details) {
  return new AppError(message || 'No encontrado', 404, details);
}

function conflict(message, details) {
  return new AppError(message || 'Conflicto', 409, details);
}

function unauthorized(message) {
  return new AppError(message || 'No autorizado', 401);
}

module.exports = {
  AppError,
  badRequest,
  notFound,
  conflict,
  unauthorized,
};

