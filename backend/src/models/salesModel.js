const { db } = require('./inventoryModel');
const { httpError } = require('../utils/errorHandler');

async function createSale({ storeId, cashierId, paymentMethod, items }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    let total = 0;
    const lockedItems = [];
    for (const item of items) {
      const result = await client.query(
        `SELECT i.quantity, p.selling_price FROM inventory i JOIN products p ON p.id = i.product_id
         WHERE i.store_id = $1 AND i.product_id = $2 FOR UPDATE`,
        [storeId, item.productId]
      );
      const row = result.rows[0];
      if (!row) throw httpError(`Product ${item.productId} is not stocked at this store`);
      if (row.quantity < item.quantity) throw httpError(`Insufficient stock for product ${item.productId}`);
      const unitPrice = item.unitPrice ?? Number(row.selling_price);
      total += unitPrice * item.quantity;
      lockedItems.push({ ...item, unitPrice });
    }

    const sale = await client.query(
      'INSERT INTO sales (store_id, cashier_id, payment_method, total_amount) VALUES ($1, $2, $3, $4) RETURNING id, total_amount, created_at',
      [storeId, cashierId, paymentMethod, total]
    );
    for (const item of lockedItems) {
      await client.query(
        'UPDATE inventory SET quantity = quantity - $1, updated_at = NOW() WHERE store_id = $2 AND product_id = $3',
        [item.quantity, storeId, item.productId]
      );
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [sale.rows[0].id, item.productId, item.quantity, item.unitPrice]
      );
      await client.query(
        `INSERT INTO inventory_transactions
          (transaction_type, product_id, quantity, from_store_id, sale_id, performed_by)
         VALUES ('SALE', $1, $2, $3, $4, $5)`,
        [item.productId, item.quantity, storeId, sale.rows[0].id, cashierId]
      );
    }
    await client.query('COMMIT');
    return sale.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { db, createSale };
