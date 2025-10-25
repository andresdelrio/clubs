const { ADMIN_ACCESS_CODE } = process.env;

function getProvidedCode(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  if (req.headers['x-admin-code']) {
    return String(req.headers['x-admin-code']).trim();
  }
  return null;
}

function requireAdmin(req, res, next) {
  if (!ADMIN_ACCESS_CODE) {
    return res.status(500).json({
      success: false,
      message: 'Código de administrador no configurado',
    });
  }

  const provided = getProvidedCode(req);
  if (!provided || provided !== ADMIN_ACCESS_CODE) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado',
    });
  }

  return next();
}

module.exports = {
  requireAdmin,
};

