const db = require('../config/db');

async function listInventory(storeId) {
  const params = [];
  let filter = '';
  if (storeId) {
    params.push(storeId);
    filter = 'WHERE i.store_id = $1';
  }
  const result = await db.query(
    `SELECT i.store_id, s.name AS store_name, i.product_id, p.name, p.size, p.color,
            p.created_at AS product_created_at,
            p.cost_price, p.selling_price, i.quantity, s.low_stock_threshold
     FROM inventory i JOIN stores s ON s.id = i.store_id
     JOIN products p ON p.id = i.product_id ${filter}
     ORDER BY s.id, p.name, p.size`,
    params
  );
  return result.rows;
}

async function listTransactions(storeId) {
  const params = [];
  const clauses = [];
  if (storeId) {
    params.push(storeId);
    clauses.push(`(t.from_store_id = $${params.length} OR t.to_store_id = $${params.length})`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await db.query(
    `SELECT t.id, t.transaction_type, t.quantity, t.notes, t.created_at,
            p.name, p.size, p.color, fs.name AS from_store, ts.name AS to_store,
            u.full_name AS performed_by
     FROM inventory_transactions t JOIN products p ON p.id = t.product_id
     LEFT JOIN stores fs ON fs.id = t.from_store_id LEFT JOIN stores ts ON ts.id = t.to_store_id
     JOIN users u ON u.id = t.performed_by ${where} ORDER BY t.created_at DESC LIMIT 200`,
    params
  );
  return result.rows;
}

module.exports = { db, listInventory, listTransactions };
