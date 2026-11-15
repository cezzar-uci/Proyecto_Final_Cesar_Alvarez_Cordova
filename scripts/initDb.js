'use strict';
require('dotenv').config();
const { initializeDatabase, getPool } = require('../config/database');
initializeDatabase()
  .then(async () => { console.log('Tablas PostgreSQL preparadas.'); await getPool().end(); })
  .catch(err => { console.error('Error al crear tablas:', err.message); process.exit(1); });
