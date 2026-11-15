'use strict';
const crypto = require('crypto');
const COOKIE_NAME = 'taskforge_csrf';

function isValidSignature(token, secret) {
  if (typeof token !== 'string') return false;
  const [nonce, mac, extra] = token.split('.');
  if (!nonce || !mac || extra) return false;
  const calculated = crypto.createHmac('sha256', secret).update(nonce).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(calculated);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function csrfProtection(req, res, next) {
  const secret = process.env.JWT_SECRET;
  const cookie = req.cookies[COOKIE_NAME];
  let token = cookie && isValidSignature(cookie, secret) ? cookie : null;
  if (!token && req.method === 'GET') {
    const nonce = crypto.randomBytes(32).toString('base64url');
    const mac = crypto.createHmac('sha256', secret).update(nonce).digest('base64url');
    token = `${nonce}.${mac}`;
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, path: '/'
    });
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const submitted = req.body && req.body._csrf;
    if (!token || !submitted || typeof submitted !== 'string') {
      const err = new Error('La sesión del formulario caducó. Actualiza la página y vuelve a intentarlo.');
      err.status = 403;
      return next(err);
    }
    const a = Buffer.from(token);
    const b = Buffer.from(submitted);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      const err = new Error('Token de formulario no válido.');
      err.status = 403;
      return next(err);
    }
  }
  res.locals.csrfToken = token;
  next();
}

module.exports = csrfProtection;
