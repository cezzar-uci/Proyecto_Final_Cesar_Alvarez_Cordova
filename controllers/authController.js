'use strict';
const { validationResult } = require('express-validator');
const authService = require('../services/authService');

const pickErrors = req => validationResult(req).array().map(item => item.msg);

function showLogin(req, res) {
  res.render('auth/login', { title: 'Iniciar sesión', errors: [], email: '' });
}

function showRegister(req, res) {
  res.render('auth/register', { title: 'Crear cuenta', errors: [], values: { name: '', email: '' } });
}

async function register(req, res) {
  const errors = pickErrors(req);
  const values = { name: String(req.body.name || ''), email: String(req.body.email || '') };
  if (errors.length) return res.status(422).render('auth/register', { title: 'Crear cuenta', errors, values });
  try {
    const user = await authService.register(req.body);
    res.cookie('taskforge_token', authService.makeToken(user), authService.cookieOptions());
    return res.redirect('/tareas?msg=welcome');
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).render('auth/register', { title: 'Crear cuenta', errors: [err.message], values });
    }
    throw err;
  }
}

async function login(req, res) {
  const errors = pickErrors(req);
  const email = String(req.body.email || '');
  if (errors.length) return res.status(422).render('auth/login', { title: 'Iniciar sesión', errors, email });
  const user = await authService.authenticate(req.body);
  if (!user) {
    return res.status(401).render('auth/login', {
      title: 'Iniciar sesión', errors: ['Correo o contraseña incorrectos.'], email
    });
  }
  res.cookie('taskforge_token', authService.makeToken(user), authService.cookieOptions());
  return res.redirect('/tareas?msg=hello');
}

function logout(req, res) {
  res.clearCookie('taskforge_token', { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.redirect('/?msg=logout');
}

module.exports = { showLogin, showRegister, register, login, logout };
