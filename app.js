'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const { loadUser } = require('./middlewares/auth');
const csrfProtection = require('./middlewares/csrf');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { initializeDatabase } = require('./config/database');
const { createInitialAdmin } = require('./scripts/initAdmin');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Render termina HTTPS antes de enviar al servidor.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use(helmet({ contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : null } } }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.use(express.urlencoded({ extended: false, limit: '15kb' }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  res.locals.flash = {
    welcome: '¡Cuenta creada! Comienza organizando tus ideas.',
    hello: '¡Bienvenido de nuevo!',
    created: 'La tarea se creó correctamente.',
    updated: 'La tarea se actualizó correctamente.',
    deleted: 'La tarea se eliminó correctamente.',
    logout: 'Cerraste sesión correctamente.',
    'login-required': 'Inicia sesión para acceder a tus tareas.'
  }[req.query.msg] || '';
  res.locals.csrfToken = '';
  next();
});
app.use(require('./middlewares/asyncHandler')(loadUser));
app.use(csrfProtection);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'TaskForge' }));
app.get('/', (req, res) => {
  if (req.user) return res.redirect('/tareas');
  return res.render('home', { title: 'Organiza lo importante' });
});
app.use('/auth', require('./routes/auth'));
app.use('/tareas', require('./routes/tasks'));
app.use(notFound);
app.use(errorHandler);

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('REEMPLAZAR')) {
    throw new Error('Configura JWT_SECRET con al menos 32 caracteres aleatorios en .env.');
  }
  await initializeDatabase();
  await createInitialAdmin();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`TaskForge activo: http://localhost:${port}`));
}

if (require.main === module) {
  start().catch(err => {
    console.error('No se pudo iniciar TaskForge:', err.message);
    process.exit(1);
  });
}
module.exports = { app, start };
