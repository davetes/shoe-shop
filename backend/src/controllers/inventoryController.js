const { db, listInventory, listTransactions } = require('../models/inventoryModel');
const { httpError } = require('../utils/errorHandler');

function permittedStore(req, requested) {
  if (req.user.role === 'OWNER') return requested || null;
  if (requested && Number(requested) !== Number(req.user.storeId)) throw httpError('You can only access your assigned store', 403);
  return req.user.storeId;
}

async function inventory(req, res) {
  res.json(await listInventory(permittedStore(req, req.query.storeId)));
}

async function transactions(req, res) {
  res.json(await listTransactions(permittedStore(req, req.query.storeId)));
}

async function importStock(req, res) {
  const storeId = permittedStore(req, req.body.storeId);
  const { productId, quantity, notes } = req.body;
  if (!storeId) throw httpError('storeId is required');
  if (!productId || !Number.isInteger(quantity) || quantity <= 0) throw httpError('productId and a positive integer quantity are required');
  await db.query(
    `INSERT INTO inventory (store_id, product_id, quantity) VALUES ($1, $2, $3)
     ON CONFLICT (store_id, product_id) DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity, updated_at = NOW()`,
    [storeId, productId, quantity]
  );
  await db.query(
    `INSERT INTO inventory_transactions (transaction_type, product_id, quantity, to_store_id, performed_by, notes)
     VALUES ('IMPORT', $1, $2, $3, $4, $5)`,
    [productId, quantity, storeId, req.user.id, notes || null]
  );
  res.status(201).json({ message: 'Stock imported' });
}

async function exportStock(req, res) {
  const fromStoreId = permittedStore(req, req.body.fromStoreId);
  const { toStoreId, productId, quantity, notes } = req.body;
  if (!toStoreId || !productId || !Number.isInteger(quantity) || quantity <= 0) throw httpError('Destination, product, and positive quantity are required');
  if (Number(toStoreId) === Number(fromStoreId)) throw httpError('Destination store must be different');
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const stock = await client.query('SELECT quantity FROM inventory WHERE store_id = $1 AND product_id = $2 FOR UPDATE', [fromStoreId, productId]);
    if (!stock.rows[0] || stock.rows[0].quantity < quantity) throw httpError('Insufficient stock', 400);
    await client.query('UPDATE inventory SET quantity = quantity - $1, updated_at = NOW() WHERE store_id = $2 AND product_id = $3', [quantity, fromStoreId, productId]);
    await client.query(
      `INSERT INTO inventory (store_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (store_id, product_id) DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity, updated_at = NOW()`,
      [toStoreId, productId, quantity]
    );
    await client.query(
      `INSERT INTO inventory_transactions
       (transaction_type, product_id, quantity, from_store_id, to_store_id, performed_by, notes)
       VALUES ('EXPORT', $1, $2, $3, $4, $5, $6)`,
      [productId, quantity, fromStoreId, toStoreId, req.user.id, notes || null]
    );
    await client.query('COMMIT');
    res.status(201).json({ message: 'Stock transferred' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateStock(req, res) {
  const storeId = permittedStore(req, req.body.storeId);
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);
  if (!storeId || !Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 0) {
    throw httpError('A store, product, and non-negative integer quantity are required');
  }
  const result = await db.query(
    `UPDATE inventory SET quantity = $1, updated_at = NOW()
     WHERE store_id = $2 AND product_id = $3
     RETURNING store_id, product_id, quantity`,
    [quantity, storeId, productId]
  );
  if (!result.rows[0]) throw httpError('Shoe is not stocked in this store', 404);
  res.json(result.rows[0]);
}

module.exports = { inventory, transactions, importStock, exportStock, updateStock };
