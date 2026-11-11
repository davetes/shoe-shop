const db = require('../config/db');

async function findUserByEmail(email) {
  const result = await db.query(
    'SELECT id, full_name, email, password_hash, role, store_id FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rows[0];
}

module.exports = { findUserByEmail };
