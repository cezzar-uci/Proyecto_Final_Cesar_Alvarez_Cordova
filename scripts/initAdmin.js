'use strict';
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createInitialAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email && !password) return;
  if (!email || !password || password.length < 12) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres) deben configurarse juntos.');
  }
  const existing = await User.findByEmail(email);
  if (existing?.role === 'admin') return;
  const hash = await bcrypt.hash(password, 12);
  const user = await User.promoteAdmin(email, 'Administrador', hash);
  console.log(`Administrador configurado: ${user.email}`);
}
module.exports = { createInitialAdmin };
