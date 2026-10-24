// Pruebas de compilación y versión sellada. (3.3)
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path'), cp = require('child_process');
const { raiz, leer } = require('./helpers');
const ejecutar = s => cp.execFileSync(process.execPath, [path.join(raiz, 'scripts', s)], { cwd: raiz, env: { ...process.env, GITHUB_SHA: 'abcdef1234567' } }).toString();
const version = JSON.parse(leer('package.json')).version;

test('build:pwa sella versión, commit y fecha en index.html y la caché del service worker', () => {
  ejecutar('build-pwa.js');
  const idx = fs.readFileSync(path.join(raiz, 'dist/site/index.html'), 'utf8');
  assert.match(idx, new RegExp("^const APP_VERSION = '" + version.replace(/\./g, '\\.') + "';$", 'm'));
  assert.match(idx, /^const APP_COMMIT = 'abcdef1';$/m);
  assert.match(idx, /^const APP_BUILD = '\d{4}-\d{2}-\d{2}';$/m);
  assert.match(fs.readFileSync(path.join(raiz, 'dist/site/sw.js'), 'utf8'), /^const CACHE_VERSION = 'abcdef1';$/m);
  for (const f of ['privacidad.html', 'manifest.webmanifest', 'icons/icon-512.png']) assert.ok(fs.existsSync(path.join(raiz, 'dist/site', f)), 'falta ' + f);
});

test('el fuente sin sellar muestra "desarrollo"', () => {
  assert.match(leer('index.html'), /^const APP_VERSION = 'desarrollo';$/m);
  assert.match(leer('index.html'), /^const APP_COMMIT = '';$/m);
});

test('build:android-web sella igual y no incluye service worker ni manifest', () => {
  ejecutar('build-android-web.js');
  const idx = fs.readFileSync(path.join(raiz, 'dist/app/index.html'), 'utf8');
  assert.match(idx, /^const APP_COMMIT = 'abcdef1';$/m);
  assert.ok(!fs.existsSync(path.join(raiz, 'dist/app/sw.js')), 'el APK no debe llevar service worker');
  assert.ok(!fs.existsSync(path.join(raiz, 'dist/app/manifest.webmanifest')), 'el APK no debe llevar manifest');
});

test('package.json: nombre, semver, privado, MIT y Node >= 22', () => {
  const p = JSON.parse(leer('package.json'));
  assert.ok(p.name && /^\d+\.\d+\.\d+$/.test(p.version) && p.private === true && p.license === 'MIT');
  assert.match(p.engines.node, /^>=\s*22/);
  for (const s of ['test', 'build:pwa', 'build:android-web', 'android:sync', 'android:debug', 'android:release']) assert.ok(p.scripts[s], 'falta el script ' + s);
});
