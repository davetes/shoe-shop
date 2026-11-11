const bcrypt = require('bcryptjs');
const { findUserByEmail } = require('../models/authModel');
const { createToken } = require('../utils/helpers');
const { httpError } = require('../utils/errorHandler');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw httpError('Email and password are required');
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw httpError('Invalid email or password', 401);
  res.json({
    token: createToken(user),
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role, storeId: user.store_id }
  });
}

module.exports = { login };
