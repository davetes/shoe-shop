const db = require('../config/db');

async function listCashiers() {
  const result = await db.query(
    `SELECT u.id, u.full_name, u.email, u.store_id, s.name AS store_name, u.created_at
     FROM users u JOIN stores s ON s.id = u.store_id
     WHERE u.role = 'CASHIER' ORDER BY u.full_name`
  );
  return result.rows;
}

async function createCashier({ fullName, email, passwordHash, storeId }) {
  const result = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role, store_id)
     VALUES ($1, $2, $3, 'CASHIER', $4)
     RETURNING id, full_name, email, store_id, created_at`,
    [fullName, email, passwordHash, storeId]
  );
  return result.rows[0];
}

async function updateCashierPassword(id, passwordHash) {
  const result = await db.query(
    `UPDATE users SET password_hash = $1
     WHERE id = $2 AND role = 'CASHIER'
     RETURNING id, full_name, email`,
    [passwordHash, id]
  );
  return result.rows[0];
}

module.exports = { listCashiers, createCashier, updateCashierPassword };
