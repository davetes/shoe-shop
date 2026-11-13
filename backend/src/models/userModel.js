const db = require('../config/db');
const { httpError } = require('../utils/errorHandler');

async function listCashiers() {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.username, u.store_id, s.name AS store_name, u.created_at
     FROM users u JOIN stores s ON s.id = u.store_id
     WHERE u.role = 'CASHIER' ORDER BY u.full_name`
  );
  return result.rows;
}

async function createCashier({ fullName, username, passwordHash, storeId }) {
  try {
    const result = await db.query(
      `INSERT INTO users (full_name, username, password_hash, role, store_id)
       VALUES ($1, $2, $3, 'CASHIER', $4)
       RETURNING id, full_name, username, store_id, created_at`,
      [fullName, username, passwordHash, storeId]
    );
    return result.rows[0];
  } catch (error) {
    throwUsernameConflict(error);
  }
}

async function updateCashierPassword(id, passwordHash) {
  const result = await db.query(
    `UPDATE users SET password_hash = $1
     WHERE id = $2 AND role = 'CASHIER'
     RETURNING id, full_name, username`,
    [passwordHash, id]
  );
  return result.rows[0];
}

async function updateCashier({ id, fullName, username, passwordHash }) {
  try {
    const result = await db.query(
      `UPDATE users SET full_name = $1, username = $2, password_hash = COALESCE($3, password_hash)
       WHERE id = $4 AND role = 'CASHIER'
       RETURNING id, full_name, username, store_id`,
      [fullName, username, passwordHash, id]
    );
    return result.rows[0];
  } catch (error) {
    throwUsernameConflict(error);
  }
}

function throwUsernameConflict(error) {
  if (error.code === '23505' && ['users_username_lower_unique', 'users_username_unique'].includes(error.constraint)) {
    throw httpError('Username is already in use', 409);
  }
  throw error;
}

module.exports = { listCashiers, createCashier, updateCashierPassword, updateCashier };
