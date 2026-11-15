'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const directories = ['.', 'config', 'controllers', 'models', 'routes', 'services', 'middlewares', 'scripts', 'utils', 'tests', 'public/js'];
let checked = 0;
for (const dir of directories) {
  const full = path.join(__dirname, '..', dir);
  for (const file of fs.readdirSync(full)) {
    if (!file.endsWith('.js')) continue;
    execFileSync(process.execPath, ['--check', path.join(full, file)], { stdio: 'pipe' });
    checked++;
  }
}
console.log(`${checked} archivos JavaScript válidos.`);
