'use strict';
const validPriority = ['baja', 'media', 'alta'];
const validStatus = ['pendiente', 'en_progreso', 'completada'];

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateTask(input) {
  const data = {
    title: String(input.title ?? '').trim(),
    description: String(input.description ?? '').trim(),
    category: String(input.category ?? '').trim() || 'General',
    priority: String(input.priority ?? 'media'),
    status: String(input.status ?? 'pendiente'),
    due_date: input.due_date ? String(input.due_date).trim() : null
  };
  const errors = [];
  if (data.title.length < 3 || data.title.length > 100) errors.push('El título debe tener entre 3 y 100 caracteres.');
  if (data.description.length > 2000) errors.push('La descripción no puede superar 2000 caracteres.');
  if (data.category.length > 40) errors.push('La categoría no puede superar 40 caracteres.');
  if (!validPriority.includes(data.priority)) errors.push('La prioridad no es válida.');
  if (!validStatus.includes(data.status)) errors.push('El estado no es válido.');
  if (data.due_date && !isRealDate(data.due_date)) errors.push('La fecha de vencimiento no es válida.');
  return { data, errors };
}

function listFilters(query) {
  const search = String(query.search ?? '').trim().slice(0, 100);
  const status = validStatus.includes(query.status) ? query.status : '';
  const priority = validPriority.includes(query.priority) ? query.priority : '';
  const parsedPage = Number(query.page);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 100000) : 1;
  return { search, status, priority, page, limit: 8 };
}

module.exports = { validateTask, listFilters, isRealDate };
