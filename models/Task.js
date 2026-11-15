'use strict';
const db = require('../config/database');

// Todas las consultas usan parametros y restringen por propietario.
// El administrador puede consultar y borrar tareas ajenas, pero no editarlas.
function scope(viewer, params) {
  if (viewer.role === 'admin') return '';
  params.push(viewer.id);
  return `t.user_id = $${params.length}`;
}

async function list(viewer, { search = '', status = '', priority = '', page = 1, limit = 8 }) {
  const params = [];
  const conditions = [];
  const ownerFilter = scope(viewer, params);
  if (ownerFilter) conditions.push(ownerFilter);
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(t.title ILIKE $${params.length} OR t.category ILIKE $${params.length})`);
  }
  if (status) {
    params.push(status);
    conditions.push(`t.status = $${params.length}`);
  }
  if (priority) {
    params.push(priority);
    conditions.push(`t.priority = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countResult = await db.query(`SELECT COUNT(*)::int AS total FROM tasks t ${where}`, params);
  const total = countResult.rows[0].total;
  const taskParams = [...params, limit, (page - 1) * limit];
  const { rows } = await db.query(
    `SELECT t.id, t.user_id, t.title, t.description, t.category, t.priority, t.status,
            TO_CHAR(t.due_date, 'YYYY-MM-DD') AS due_date,
            t.created_at, t.updated_at, u.name AS owner_name
     FROM tasks t JOIN users u ON u.id = t.user_id ${where}
     ORDER BY CASE WHEN t.status = 'completada' THEN 1 ELSE 0 END,
              t.due_date ASC NULLS LAST, t.created_at DESC
     LIMIT $${taskParams.length - 1} OFFSET $${taskParams.length}`,
    taskParams
  );
  return { tasks: rows, total, page, pages: Math.max(1, Math.ceil(total / limit)), limit };
}

async function stats(viewer) {
  const params = [];
  const filter = scope(viewer, params);
  const where = filter ? `WHERE ${filter}` : '';
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE t.status = 'completada')::int AS completed,
        COUNT(*) FILTER (WHERE t.status = 'en_progreso')::int AS in_progress,
        COUNT(*) FILTER (WHERE t.status = 'pendiente')::int AS pending,
        COUNT(*) FILTER (WHERE t.priority = 'alta' AND t.status != 'completada')::int AS urgent
     FROM tasks t ${where}`, params
  );
  return rows[0];
}

async function findVisible(id, viewer) {
  const params = [id];
  const extra = scope(viewer, params);
  const { rows } = await db.query(
    `SELECT t.*, TO_CHAR(t.due_date, 'YYYY-MM-DD') AS due_date, u.name AS owner_name
     FROM tasks t JOIN users u ON u.id = t.user_id
     WHERE t.id = $1 ${extra ? `AND ${extra}` : ''}`, params
  );
  return rows[0] || null;
}

async function create(userId, data) {
  const { rows } = await db.query(
    `INSERT INTO tasks (user_id, title, description, category, priority, status, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [userId, data.title, data.description, data.category, data.priority, data.status, data.due_date]
  );
  return rows[0];
}

async function updateOwned(id, userId, data) {
  const { rows } = await db.query(
    `UPDATE tasks SET title=$1, description=$2, category=$3, priority=$4,
     status=$5, due_date=$6, updated_at=NOW() WHERE id=$7 AND user_id=$8 RETURNING id`,
    [data.title, data.description, data.category, data.priority, data.status, data.due_date, id, userId]
  );
  return rows[0] || null;
}

async function deleteVisible(id, viewer) {
  const params = [id];
  const extra = scope(viewer, params);
  const { rows } = await db.query(
    `DELETE FROM tasks t WHERE id=$1 ${extra ? `AND ${extra}` : ''} RETURNING id`, params
  );
  return rows[0] || null;
}

module.exports = { list, stats, findVisible, create, updateOwned, deleteVisible };
