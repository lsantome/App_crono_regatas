// Pruebas de la PWA: sintaxis, manifest, service worker, red y almacenamiento. (3.8 puntos 1-5)
const test = require('node:test'), assert = require('node:assert'), vm = require('node:vm');
const { leer, existe, dimsPng } = require('./helpers');

test('1. sintaxis del script inline de index.html y de sw.js', () => {
  const html = leer('index.html');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(m => !/type\s*=\s*["']?(application\/json|application\/ld\+json)/.test(m[1])).map(m => m[2]);
  assert.ok(scripts.length > 0, 'no hay <script> inline en index.html');
  scripts.forEach((s, i) => assert.doesNotThrow(() => new vm.Script(s, { filename: 'index.html#script' + i }), 'error de sintaxis en index.html'));
  assert.doesNotThrow(() => new vm.Script(leer('sw.js'), { filename: 'sw.js' }), 'error de sintaxis en sw.js');
});

test('2. manifest: campos obligatorios, id propio y estable, iconos existentes', () => {
  const m = JSON.parse(leer('manifest.webmanifest'));
  for (const k of ['name', 'short_name', 'id', 'start_url', 'scope', 'display', 'icons', 'background_color', 'theme_color'])
    assert.ok(m[k], 'falta ' + k);
  assert.strictEqual(m.id, 'regatas-cronometraje', 'el id del manifest NO debe cambiar: la PWA instalada dejaría de reconocerse');
  assert.ok(!/^[./]/.test(m.id), 'id no puede resolver a la raíz del origen (colisiona con otras PWA de lsantome.github.io)');
  assert.strictEqual(m.start_url, './'); assert.strictEqual(m.scope, './');
  let a192 = false, a512 = false, mask = false;
  for (const ic of m.icons) {
    assert.ok(existe(ic.src), 'no existe ' + ic.src);
    const [w, h] = dimsPng(ic.src);
    assert.strictEqual(ic.sizes, w + 'x' + h, ic.src + ' declara ' + ic.sizes + ' pero mide ' + w + 'x' + h);
    if (w === 192 && ic.purpose === 'any') a192 = true;
    if (w === 512 && ic.purpose === 'any') a512 = true;
    if (ic.purpose === 'maskable') mask = true;
  }
  assert.ok(a192 && a512 && mask, 'faltan iconos 192, 512 o maskable');
  assert.deepStrictEqual(dimsPng('icons/apple-touch-icon.png'), [180, 180]);
});

test('3. service worker: prefijo de caché propio y borra solo cachés propias', async () => {
  const src = leer('sw.js');
  assert.match(src, /const CACHE_PREFIX = 'regatas-cronometraje-';/);
  const borradas = [], oyentes = {};
  const caches = {
    keys: async () => ['regatas-cronometraje-viejo', 'regatas-cronometraje-nuevo', 'regatas-abcdef0', 'regatas-v1',
                       'optimizador-alineacion-remo-1a2b3c', 'desarrollos-calculadora-v3', 'ritmo-remada-x'],
    delete: async n => { borradas.push(n); return true; }, open: async () => ({}), match: async () => undefined,
  };
  const sandbox = { self: { addEventListener: (t, f) => { oyentes[t] = f; }, clients: { claim: async () => {} }, location: { origin: 'https://x' } },
                    caches, console, URL, Request: function () {}, fetch: async () => ({}) };
  vm.runInNewContext(src.replace(/^const CACHE_VERSION = .*;$/m, "const CACHE_VERSION = 'nuevo';"), sandbox);
  let espera; oyentes.activate({ waitUntil: p => { espera = p; } }); await espera;
  assert.deepStrictEqual(borradas.sort(), ['regatas-abcdef0', 'regatas-cronometraje-viejo', 'regatas-v1'],
    'solo debe borrar cachés propias (actuales o legado) y nunca las de otras apps');
});

test('4. sin referencias externas: la app funciona sin red', () => {
  const patrones = [/(?:src|href)\s*=\s*["']https?:/gi, /url\(\s*["']?https?:/gi, /@import\s+["']?https?:/gi,
                    /\bfetch\(\s*["'`]https?:/gi, /\bimport\(\s*["']https?:/gi, /new\s+(?:WebSocket|EventSource)\(\s*["'`]/gi];
  for (const f of ['index.html', 'sw.js', 'manifest.webmanifest'])
    for (const p of patrones) assert.ok(!p.test(leer(f)), f + ' carga un recurso externo: ' + p);
});

test('5. almacenamiento: todas las claves llevan el prefijo "regatas."', () => {
  const html = leer('index.html');
  const consts = {};
  for (const m of html.matchAll(/\bconst\s+([A-Z_]+)\s*=\s*['"]([^'"]+)['"]/g)) consts[m[1]] = m[2];
  const claves = [];
  for (const m of html.matchAll(/(?:localStorage|sessionStorage)\.(?:get|set|remove)Item\(\s*([^,)]+)/g)) {
    const a = m[1].trim();
    claves.push(/^['"]/.test(a) ? a.slice(1, -1) : consts[a]);
  }
  assert.ok(claves.length > 0, 'no se encontró ninguna clave de almacenamiento');
  claves.forEach(c => { assert.ok(c, 'clave de almacenamiento no resoluble (usa una constante const NOMBRE = \'regatas.…\')'); assert.ok(c.startsWith('regatas.'), 'clave sin prefijo regatas.: ' + c); });
  assert.ok(!/indexedDB\.open\(/.test(html) || /indexedDB\.open\(\s*['"]regatas/.test(html), 'IndexedDB sin prefijo regatas');
});
