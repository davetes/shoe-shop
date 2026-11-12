const db = require('../config/db');

async function list(req, res) {
  const result = await db.query('SELECT id, name, low_stock_threshold FROM stores ORDER BY id');
  res.json(result.rows);
}

async function updateThreshold(req, res) {
  const threshold = Number(req.body.threshold);
  if (!Number.isInteger(threshold) || threshold < 0) {
    const error = new Error('Threshold must be a non-negative whole number');
    error.statusCode = 400;
    throw error;
  }
  const result = await db.query(
    'UPDATE stores SET low_stock_threshold = $1 RETURNING id, name, low_stock_threshold',
    [threshold]
  );
  res.json(result.rows);
}

async function create(req, res) {
  const { name, threshold = 5 } = req.body;
  if (!name || !String(name).trim()) {
    const error = new Error('Store name is required');
    error.statusCode = 400;
    throw error;
  }
  const result = await db.query(
    `INSERT INTO stores (name, low_stock_threshold) VALUES ($1, $2)
     RETURNING id, name, low_stock_threshold`,
    [String(name).trim(), Number(threshold)]
  );
  res.status(201).json(result.rows[0]);
}

async function update(req, res) {
  const { name, threshold } = req.body;
  if (!name || !String(name).trim() || !Number.isInteger(Number(threshold)) || Number(threshold) < 0) {
    const error = new Error('Store name and a non-negative threshold are required');
    error.statusCode = 400;
    throw error;
  }
  const result = await db.query(
    `UPDATE stores SET name = $1, low_stock_threshold = $2 WHERE id = $3
     RETURNING id, name, low_stock_threshold`,
    [String(name).trim(), Number(threshold), req.params.id]
  );
  if (!result.rows[0]) {
    const error = new Error('Store not found');
    error.statusCode = 404;
    throw error;
  }
  res.json(result.rows[0]);
}

module.exports = { list, updateThreshold, create, update };
