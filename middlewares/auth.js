'use strict';
const User = require('../models/User');
const authService = require('../services/authService');

async function loadUser(req, res, next) {
  req.user = null;
  res.locals.user = null;
  const token = req.cookies.taskforge_token;
  if (!token) return next();
  try {
    const decoded = authService.verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (user) {
      req.user = user;
      res.locals.user = user;
    } else {
      res.clearCookie('taskforge_token', { path: '/' });
    }
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
      res.clearCookie('taskforge_token', { path: '/' });
    } else return next(err);
  }
  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect('/auth/iniciar-sesion?msg=login-required');
  next();
}

function onlyGuest(req, res, next) {
  if (req.user) return res.redirect('/tareas');
  next();
}

module.exports = { loadUser, requireAuth, onlyGuest };
