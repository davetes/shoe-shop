const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { httpError } = require('../utils/errorHandler');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next(httpError('Authentication required', 401));
  try {
    req.user = jwt.verify(header.slice(7), config.jwtSecret);
    next();
  } catch {
    next(httpError('Invalid or expired token', 401));
  }
}

module.exports = { authenticate };
