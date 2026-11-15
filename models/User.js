'use strict';
const db = require('../config/database');

async function findByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ name, email, passwordHash }) {
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, passwordHash, 'user']
  );
  return rows[0];
}

async function promoteAdmin(email, name, passwordHash) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin'
     RETURNING id, email, role`,
    [name, email, passwordHash]
  );
  return rows[0];
}

module.exports = { findByEmail, findById, create, promoteAdmin };
