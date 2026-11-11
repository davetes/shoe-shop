const { httpError } = require('../utils/errorHandler');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(httpError('Forbidden', 403));
    next();
  };
}

module.exports = { requireRole };
