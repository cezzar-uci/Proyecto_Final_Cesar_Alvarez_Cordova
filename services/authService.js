'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    return await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash });
  } catch (err) {
    if (err.code === '23505') {
      const conflict = new Error('Ya existe una cuenta con ese correo electrónico.');
      conflict.status = 409;
      throw conflict;
    }
    throw err;
  }
}

async function authenticate({ email, password }) {
  const user = await User.findByEmail(email.trim().toLowerCase());
  // Reduce diferencias de tiempo cuando el email no existe.
  const dummyHash = '$2b$12$abcdefghijklmnopqrstuu1HfTXGiBMvx3g5vZTT8zZ7F8yzbdhhK';
  const match = await bcrypt.compare(password, user ? user.password_hash : dummyHash);
  return user && match ? user : null;
}

function makeToken(user) {
  return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    issuer: 'taskforge', audience: 'taskforge-web', expiresIn: '2d'
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'taskforge', audience: 'taskforge-web', algorithms: ['HS256']
  });
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000,
    path: '/'
  };
}

module.exports = { register, authenticate, makeToken, verifyToken, cookieOptions };
