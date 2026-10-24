// Identidad de una compilación, compartida por build-pwa.js y build-android-web.js.
//   version → "version" de package.json (fuente única; también es el versionName de Android).
//   commit  → hash corto del commit (GITHUB_SHA en CI; git en local; "local" si no hay git).
//   fecha   → fecha de compilación en UTC (AAAA-MM-DD). SOURCE_DATE_EPOCH (segundos) la fija.
// El commit es también la versión de la caché del service worker: cada despliegue nuevo la invalida.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const raiz = path.join(__dirname, '..');

function versionPaquete() {
  const v = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8')).version;
  if (!/^\d+\.\d+\.\d+$/.test(v)) throw new Error('package.json: "version" debe ser semver X.Y.Z (es "' + v + '")');
  return v;
}

function commitCorto() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return cp.execSync('git rev-parse --short=7 HEAD', { cwd: raiz, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (e) { return 'local'; }
}

function fechaCompilacion() {
  const e = process.env.SOURCE_DATE_EPOCH;
  const ms = e && /^\d+$/.test(e) ? Number(e) * 1000 : Date.now();
  return new Date(ms).toISOString().slice(0, 10);
}

function identidad() {
  return { version: versionPaquete(), commit: commitCorto(), fecha: fechaCompilacion() };
}

// Sustituye UNA línea "const NOMBRE = ...;" y falla si no existe: publicar sin versión impediría saber qué se ejecuta.
function fijarConstante(texto, nombre, valor, origen) {
  const re = new RegExp('^const ' + nombre + ' = .*;[ \\t]*$', 'm');
  if (!re.test(texto)) throw new Error(origen + ': no se encuentra la línea "const ' + nombre + ' = …;"');
  return texto.replace(re, () => "const " + nombre + " = '" + valor + "';");
}

function estamparIndex(html, id) {
  html = fijarConstante(html, 'APP_VERSION', id.version, 'index.html');
  html = fijarConstante(html, 'APP_COMMIT', id.commit, 'index.html');
  return fijarConstante(html, 'APP_BUILD', id.fecha, 'index.html');
}

function estamparSw(sw, id) {
  return fijarConstante(sw, 'CACHE_VERSION', id.commit, 'sw.js');
}

module.exports = { raiz, identidad, estamparIndex, estamparSw };
