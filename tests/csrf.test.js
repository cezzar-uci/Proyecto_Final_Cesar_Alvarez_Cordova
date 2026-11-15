'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const csrf = require('../middlewares/csrf');

process.env.JWT_SECRET = 'prueba-local-clave-privada-larga-de-mas-de-32-caracteres';

function run(method, cookies = {}, body = {}) {
  let issuedCookie;
  let nextError;
  const req = { method, cookies, body };
  const res = { locals: {}, cookie(name, value) { issuedCookie = value; } };
  csrf(req, res, error => { nextError = error || null; });
  return { issuedCookie, nextError, token: res.locals.csrfToken };
}

test('GET emite token CSRF firmado', () => {
  const result = run('GET');
  assert.ok(result.issuedCookie);
  assert.match(result.token, /^[\w-]+\.[\w-]+$/);
  assert.equal(result.nextError, null);
});

test('POST con token correcto se acepta', () => {
  const get = run('GET');
  const post = run('POST', { taskforge_csrf: get.token }, { _csrf: get.token });
  assert.equal(post.nextError, null);
});

test('POST sin token y POST con token alterado se rechazan', () => {
  const get = run('GET');
  assert.equal(run('POST').nextError.status, 403);
  assert.equal(run('POST', { taskforge_csrf: get.token }, { _csrf: 'falso' }).nextError.status, 403);
});
