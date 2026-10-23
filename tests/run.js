#!/usr/bin/env node
// Ejecuta todas las pruebas (tests/*.test.js) con el ejecutor de Node. Uso: npm test
const fs = require('fs'), path = require('path'), cp = require('child_process');
const archivos = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort().map(f => path.join(__dirname, f));
const r = cp.spawnSync(process.execPath, ['--test', ...archivos], { stdio: 'inherit' });
process.exit(r.status === null ? 1 : r.status);
