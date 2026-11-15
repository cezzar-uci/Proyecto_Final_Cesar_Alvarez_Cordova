'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTask, listFilters, isRealDate } = require('../utils/taskValidation');

test('Acepta tarea correcta y aplica valores por defecto', () => {
  const { data, errors } = validateTask({ title: '  Preparar parcial  ', description: 'Estudiar Node' });
  assert.deepEqual(errors, []);
  assert.equal(data.title, 'Preparar parcial');
  assert.equal(data.category, 'General');
  assert.equal(data.priority, 'media');
});

test('Rechaza título corto, prioridad desconocida y fecha imposible', () => {
  const result = validateTask({ title: 'a', priority: 'superalta', due_date: '2026-02-30' });
  assert.equal(result.errors.length, 3);
});

test('Comprueba fechas y años bisiestos', () => {
  assert.equal(isRealDate('2028-02-29'), true);
  assert.equal(isRealDate('2027-02-29'), false);
});

test('Filtros ignoran estados inválidos, limitan búsqueda y página', () => {
  const result = listFilters({ search: 'a'.repeat(120), status: 'inventado', priority: 'alta', page: '-2' });
  assert.equal(result.search.length, 100);
  assert.equal(result.status, '');
  assert.equal(result.priority, 'alta');
  assert.equal(result.page, 1);
});

test('Rechaza descripciones extensas y fechas con formato incorrecto', () => {
  const result = validateTask({ title: 'Tarea larga', description: 'z'.repeat(2001), due_date: '01/01/2027' });
  assert.equal(result.errors.length, 2);
});
