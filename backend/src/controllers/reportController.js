const { dashboard } = require('../models/reportModel');
const { dateOnly } = require('../utils/helpers');

async function getDashboard(req, res) {
  res.json(await dashboard(dateOnly(req.query.date)));
}

module.exports = { getDashboard };
