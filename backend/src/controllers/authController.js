const bcrypt = require('bcryptjs');
const { findUserByUsername } = require('../models/authModel');
const { createToken } = require('../utils/helpers');
const { httpError } = require('../utils/errorHandler');

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) throw httpError('Username and password are required');
  const user = await findUserByUsername(String(username).trim());
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw httpError('Invalid username or password', 401);
  res.json({
    token: createToken(user),
    user: { id: user.id, fullName: user.full_name, username: user.username, role: user.role, storeId: user.store_id }
  });
}

module.exports = { login };
