'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Ejecuta el modelo con una base de datos simulada: no requiere npm ni PostgreSQL.
function buildModel() {
  const calls = [];
  const db = {
    async query(sql, params) {
      calls.push({ sql, params });
      if (sql.includes('COUNT(*)::int AS total')) return { rows: [{ total: 2, completed: 0, in_progress: 1, pending: 1, urgent: 0 }] };
      if (sql.includes('DELETE') || sql.includes('UPDATE') || sql.includes('INSERT')) return { rows: [{ id: '8' }] };
      return { rows: [] };
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '../models/Task.js'), 'utf8');
  const module = { exports: {} };
  const wrapper = vm.runInNewContext(`(function (require, module, exports) { ${source}\n})`, {});
  wrapper(() => db, module, module.exports);
  return { model: module.exports, calls };
}

test('Usuario común solo lista sus tareas (filtro SQL propietario)', async () => {
  const { model, calls } = buildModel();
  await model.list({ id: 4, role: 'user' }, { search: '', status: '', priority: '', page: 1, limit: 8 });
  assert.equal(calls.length, 2);
  assert.match(calls[0].sql, /t\.user_id = \$1/);
  assert.deepEqual(Array.from(calls[1].params), [4, 8, 0]);
});

test('Administrador puede listar y borrar globalmente', async () => {
  const { model, calls } = buildModel();
  await model.list({ id: 9, role: 'admin' }, { search: '', status: '', priority: '', page: 1, limit: 8 });
  assert.doesNotMatch(calls[0].sql, /user_id = \$/);
  await model.deleteVisible(8, { id: 9, role: 'admin' });
  assert.doesNotMatch(calls[2].sql, /user_id = \$/);
});

test('Usuario no puede eliminar tarea de otra cuenta', async () => {
  const { model, calls } = buildModel();
  await model.deleteVisible(8, { id: 4, role: 'user' });
  assert.match(calls[0].sql, /AND t\.user_id = \$2/);
  assert.deepEqual(Array.from(calls[0].params), [8, 4]);
});

test('Incluso un administrador solo puede editar tareas propias', async () => {
  const { model, calls } = buildModel();
  await model.updateOwned(8, 9, { title: 'Proyecto', description: '', category: 'Clase', priority: 'media', status: 'pendiente', due_date: null });
  assert.match(calls[0].sql, /AND user_id=\$8/);
  assert.equal(calls[0].params[7], 9);
});
