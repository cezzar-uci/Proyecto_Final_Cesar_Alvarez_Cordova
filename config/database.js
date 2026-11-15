'use strict';
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool;
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('Falta DATABASE_URL en el entorno.');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ...(process.env.DATABASE_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {})
    });
    pool.on('error', err => console.error('Error de conexión PostgreSQL:', err.message));
  }
  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function initializeDatabase() {
  const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  await query(sql);
}

module.exports = { query, getPool, initializeDatabase };
