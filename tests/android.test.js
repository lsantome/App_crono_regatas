// Coherencia del proyecto Android y ausencia de secretos. (3.8 punto 6)
const test = require('node:test'), assert = require('node:assert'), cp = require('child_process');
const { raiz, leer } = require('./helpers');

test('appId coherente en capacitor.config.json, namespace y applicationId', () => {
  const cap = JSON.parse(leer('capacitor.config.json')), g = leer('android/app/build.gradle');
  assert.strictEqual(cap.appId, 'es.regatas.cronometraje', 'el appId NO debe cambiar: Android lo trataría como otra app');
  assert.strictEqual(cap.webDir, 'dist/app');
  assert.match(g, /namespace = "es\.regatas\.cronometraje"/);
  assert.match(g, /applicationId "es\.regatas\.cronometraje"/);
});

test('versionName y versionCode salen de package.json', () => {
  const g = leer('android/app/build.gradle');
  assert.match(g, /parse\(rootProject\.file\('\.\.\/package\.json'\)\)/);
  assert.match(g, /versionName pkg\.version/);
  assert.match(g, /versionCode vMajor \* 10000 \+ vMinor \* 100 \+ vPatch/);
  assert.ok(!/versionCode \d/.test(g) && !/versionName "/.test(g), 'versionCode/versionName no pueden ir escritos a mano');
});

test('versiones fijadas: AGP 8.13, Gradle 8.14, Capacitor 8.5.3', () => {
  assert.match(leer('android/build.gradle'), /com\.android\.tools\.build:gradle:8\.13\./);
  assert.match(leer('android/gradle/wrapper/gradle-wrapper.properties'), /gradle-8\.14\.\d+-/);
  const lock = JSON.parse(leer('package-lock.json')).packages;
  for (const n of ['core', 'android', 'cli']) assert.strictEqual(lock['node_modules/@capacitor/' + n].version, '8.5.3');
});

test('la firma solo se lee de variables de entorno o keystore.properties; sin contraseñas en texto plano', () => {
  const g = leer('android/app/build.gradle');
  for (const v of ['ANDROID_KEYSTORE_PATH', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD']) assert.ok(g.includes(v), 'falta ' + v);
  assert.ok(!/(storePassword|keyPassword)\s*[= ]\s*["'][^"']+["']/.test(g), 'contraseña en texto plano en build.gradle');
  assert.ok(!/(storePassword|keyPassword|storeFile)\s*=/.test(leer('android/gradle.properties')), 'firma en gradle.properties');
});

test('ningún keystore ni keystore.properties versionado', () => {
  let archivos;
  try { archivos = cp.execSync('git ls-files', { cwd: raiz, stdio: ['ignore', 'pipe', 'ignore'] }).toString().split('\n'); }
  catch (e) { return; } // sin git (p. ej. zip descargado): lo comprueba el CI
  const malos = archivos.filter(f => /\.(keystore|jks|p12)$|keystore\.properties$/i.test(f));
  assert.deepStrictEqual(malos, [], 'claves versionadas: ' + malos.join(', '));
});
