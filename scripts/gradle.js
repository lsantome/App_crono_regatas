#!/usr/bin/env node
// Ejecuta el wrapper de Gradle del proyecto Android en cualquier sistema.
// Uso: node scripts/gradle.js assembleDebug
const cp = require('child_process'), path = require('path');
const dir = path.join(__dirname, '..', 'android');
const win = process.platform === 'win32';
const r = cp.spawnSync(win ? 'gradlew.bat' : './gradlew', process.argv.slice(2), { cwd: dir, stdio: 'inherit', shell: win });
process.exit(r.status === null ? 1 : r.status);
