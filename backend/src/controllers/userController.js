const bcrypt = require('bcryptjs');
const { listCashiers, createCashier, updateCashierPassword, updateCashier } = require('../models/userModel');
const { httpError } = require('../utils/errorHandler');

async function cashiers(req, res) {
  res.json(await listCashiers());
}

async function create(req, res) {
  const { fullName, username, password, storeId } = req.body;
  const normalizedUsername = String(username || '').trim().toLowerCase();
  if (!fullName || !normalizedUsername || !password || !storeId) throw httpError('Full name, username, password, and store are required');
  if (!/^[a-z0-9._-]{3,40}$/.test(normalizedUsername)) throw httpError('Username must be 3-40 characters and use letters, numbers, dots, underscores, or hyphens');
  if (String(password).length < 6) throw httpError('Password must be at least 6 characters');
  res.status(201).json(await createCashier({
    fullName: String(fullName).trim(),
    username: normalizedUsername,
    passwordHash: await bcrypt.hash(password, 10),
    storeId: Number(storeId)
  }));
}

async function resetPassword(req, res) {
  const { password } = req.body;
  if (!password || String(password).length < 6) throw httpError('Password must be at least 6 characters');
  const cashier = await updateCashierPassword(req.params.id, await bcrypt.hash(password, 10));
  if (!cashier) throw httpError('Cashier not found', 404);
  res.json({ message: 'Cashier password updated' });
}

async function update(req, res) {
  const { fullName, username, password } = req.body;
  const normalizedUsername = String(username || '').trim().toLowerCase();
  if (!fullName || !normalizedUsername) throw httpError('Full name and username are required');
  if (!/^[a-z0-9._-]{3,40}$/.test(normalizedUsername)) throw httpError('Username must be 3-40 characters and use letters, numbers, dots, underscores, or hyphens');
  if (password && String(password).length < 6) throw httpError('Password must be at least 6 characters');
  const cashier = await updateCashier({
    id: req.params.id,
    fullName: String(fullName).trim(),
    username: normalizedUsername,
    passwordHash: password ? await bcrypt.hash(password, 10) : null
  });
  if (!cashier) throw httpError('Cashier not found', 404);
  res.json(cashier);
}

module.exports = { cashiers, create, resetPassword, update };
