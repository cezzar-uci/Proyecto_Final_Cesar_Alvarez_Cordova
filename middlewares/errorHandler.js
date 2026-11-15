'use strict';

function notFound(req, res, next) {
  const err = new Error('La página que buscas no existe.');
  err.status = 404;
  next(err);
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('[Error]', err);
  res.status(status).render('error', {
    title: `Error ${status}`,
    status,
    message: status >= 500 ? 'Ocurrió un problema inesperado. Intenta nuevamente.' : err.message
  });
}

module.exports = { notFound, errorHandler };
