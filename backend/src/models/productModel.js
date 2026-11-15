const db = require('../config/db');

async function listProducts() {
  const result = await db.query(
    `SELECT id, name, size, color, cost_price, selling_price
     FROM products ORDER BY name, size, color`
  );
  return result.rows;
}

async function createProduct({ name, size, color, costPrice, sellingPrice }) {
  const result = await db.query(
    `INSERT INTO products (name, size, color, cost_price, selling_price)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING
     RETURNING id, name, size, color, cost_price, selling_price`,
    [name, size, color, costPrice, sellingPrice]
  );
  if (result.rows[0]) return result.rows[0];

  const existing = await db.query(
    `SELECT id, name, size, color, cost_price, selling_price
     FROM products
     WHERE LOWER(name) = LOWER($1)
       AND LOWER(size) = LOWER($2)
       AND LOWER(color) = LOWER($3)
       AND cost_price = $4
       AND selling_price = $5
     LIMIT 1`,
    [name, size, color, costPrice, sellingPrice]
  );
  if (!existing.rows[0]) throw new Error('Unable to find the matching shoe after duplicate insert');
  return existing.rows[0];
}

async function updateProduct({ id, name, size, color, costPrice, sellingPrice, storeId }) {
  const result = await db.query(
    `UPDATE products SET name = $1, size = $2, color = $3, cost_price = $4, selling_price = $5
     WHERE id = $6 AND ($7::int IS NULL OR EXISTS (
       SELECT 1 FROM inventory WHERE inventory.product_id = products.id AND inventory.store_id = $7
     ))
     RETURNING id, name, size, color, cost_price, selling_price`,
    [name, size, color, costPrice, sellingPrice, id, storeId || null]
  );
  return result.rows[0];
}

module.exports = { listProducts, createProduct, updateProduct };
