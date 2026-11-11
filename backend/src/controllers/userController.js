const bcrypt = require('bcryptjs');
const { listCashiers, createCashier, updateCashierPassword } = require('../models/userModel');
const { httpError } = require('../utils/errorHandler');

async function cashiers(req, res) {
  res.json(await listCashiers());
}

async function create(req, res) {
  const { fullName, email, password, storeId } = req.body;
  if (!fullName || !email || !password || !storeId) throw httpError('Full name, email, password, and store are required');
  if (String(password).length < 6) throw httpError('Password must be at least 6 characters');
  res.status(201).json(await createCashier({
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
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

module.exports = { cashiers, create, resetPassword };
