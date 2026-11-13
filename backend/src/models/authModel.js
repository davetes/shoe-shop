const db = require('../config/db');

async function findUserByUsername(username) {
  const result = await db.query(
    'SELECT id, full_name, username, password_hash, role, store_id FROM users WHERE LOWER(username) = LOWER($1)',
    [username]
  );
  return result.rows[0];
}

module.exports = { findUserByUsername };
