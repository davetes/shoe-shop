const jwt = require('jsonwebtoken');
const config = require('../config/config');

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, storeId: user.store_id || null, fullName: user.full_name },
    config.jwtSecret,
    { expiresIn: '8h' }
  );
}

function dateOnly(value) {
  return value || new Date().toISOString().slice(0, 10);
}

module.exports = { createToken, dateOnly };
