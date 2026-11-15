'use strict';
const Task = require('../models/Task');
const service = require('../services/taskService');

const EMPTY = {
  title: '', description: '', category: 'General', priority: 'media',
  status: 'pendiente', due_date: ''
};

async function index(req, res) {
  const dashboard = await service.getDashboard(req.user, req.query);
  res.render('tasks/index', { title: 'Mis tareas', ...dashboard });
}

function showNew(req, res) {
  res.render('tasks/form', { title: 'Nueva tarea', mode: 'create', task: { ...EMPTY }, errors: [] });
}

async function create(req, res) {
  try {
    const task = await service.create(req.user, req.body);
    return res.redirect(`/tareas/${task.id}?msg=created`);
  } catch (err) {
    if (err.status === 422) return res.status(422).render('tasks/form', {
      title: 'Nueva tarea', mode: 'create', task: req.body, errors: err.details
    });
    throw err;
  }
}

async function show(req, res) {
  const task = await Task.findVisible(req.params.id, req.user);
  if (!task) return res.status(404).render('error', {
    title: 'Tarea no encontrada', status: 404, message: 'No se encontró esta tarea o no tienes acceso a ella.'
  });
  return res.render('tasks/show', { title: task.title, task });
}

async function showEdit(req, res) {
  const task = await Task.findVisible(req.params.id, req.user);
  if (!task || String(task.user_id) !== String(req.user.id)) {
    return res.status(404).render('error', {
      title: 'Tarea no encontrada', status: 404, message: 'Solo puedes editar tus propias tareas.'
    });
  }
  return res.render('tasks/form', { title: 'Editar tarea', mode: 'edit', task, errors: [] });
}

async function update(req, res) {
  try {
    const task = await service.update(req.user, req.params.id, req.body);
    if (!task) return res.status(404).render('error', {
      title: 'Tarea no encontrada', status: 404, message: 'Solo puedes editar tus propias tareas.'
    });
    return res.redirect(`/tareas/${task.id}?msg=updated`);
  } catch (err) {
    if (err.status === 422) return res.status(422).render('tasks/form', {
      title: 'Editar tarea', mode: 'edit', task: { ...req.body, id: req.params.id }, errors: err.details
    });
    throw err;
  }
}

async function remove(req, res) {
  const removed = await Task.deleteVisible(req.params.id, req.user);
  if (!removed) return res.status(404).render('error', {
    title: 'Tarea no encontrada', status: 404, message: 'No existe la tarea o no tienes permisos para eliminarla.'
  });
  return res.redirect('/tareas?msg=deleted');
}

module.exports = { index, showNew, create, show, showEdit, update, remove };
