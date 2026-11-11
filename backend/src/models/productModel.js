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
     RETURNING id, name, size, color, cost_price, selling_price`,
    [name, size, color, costPrice, sellingPrice]
  );
  return result.rows[0];
}

module.exports = { listProducts, createProduct };
