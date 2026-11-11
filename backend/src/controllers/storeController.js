const db = require('../config/db');

async function list(req, res) {
  const result = await db.query('SELECT id, name FROM stores ORDER BY id');
  res.json(result.rows);
}

module.exports = { list };
