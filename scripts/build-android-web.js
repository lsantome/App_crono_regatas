#!/usr/bin/env node
// Genera la web que entra en el APK (dist/app = webDir de Capacitor).
// Dentro del APK no hay service worker ni manifest: los archivos van en el paquete.
// Uso: npm run build:android-web
const fs = require('fs'), path = require('path');
const { raiz, identidad, estamparIndex } = require('./version.js');
const salida = path.join(raiz, 'dist', 'app');
const id = identidad();

const ARCHIVOS = ['index.html', 'icons/favicon-32.png', 'icons/apple-touch-icon.png'];

fs.rmSync(salida, { recursive: true, force: true });
for (const rel of ARCHIVOS) {
  const origen = path.join(raiz, rel);
  if (!fs.existsSync(origen) || fs.statSync(origen).size === 0) throw new Error('Falta o está vacío: ' + rel);
  const destino = path.join(salida, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  if (rel === 'index.html') fs.writeFileSync(destino, estamparIndex(fs.readFileSync(origen, 'utf8'), id));
  else fs.copyFileSync(origen, destino);
}
console.log('OK: dist/app (v' + id.version + ' · build ' + id.commit + ' · ' + id.fecha + ')');
