'use strict';
const Task = require('../models/Task');
const { validateTask, listFilters } = require('../utils/taskValidation');

function prepare(input) {
  const result = validateTask(input);
  if (result.errors.length) {
    const err = new Error(result.errors.join(' '));
    err.status = 422;
    err.details = result.errors;
    throw err;
  }
  return result.data;
}

async function getDashboard(viewer, query) {
  const filters = listFilters(query);
  const [listing, stats] = await Promise.all([Task.list(viewer, filters), Task.stats(viewer)]);
  return { ...listing, stats, filters };
}

async function create(viewer, input) {
  return Task.create(viewer.id, prepare(input));
}

async function update(viewer, id, input) {
  return Task.updateOwned(id, viewer.id, prepare(input));
}

module.exports = { prepare, getDashboard, create, update };
