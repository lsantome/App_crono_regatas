#!/usr/bin/env node
// Genera el sitio que se publica en GitHub Pages en dist/site, con la versión sellada.
// Uso: npm run build:pwa
const fs = require('fs'), path = require('path');
const { raiz, identidad, estamparIndex, estamparSw } = require('./version.js');
const salida = path.join(raiz, 'dist', 'site');
const id = identidad();

const ARCHIVOS = [
  'index.html', 'privacidad.html', 'manifest.webmanifest', 'sw.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon-32.png',
];

fs.rmSync(salida, { recursive: true, force: true });
for (const rel of ARCHIVOS) {
  const origen = path.join(raiz, rel);
  if (!fs.existsSync(origen) || fs.statSync(origen).size === 0) throw new Error('Falta o está vacío: ' + rel);
  const destino = path.join(salida, rel);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  if (rel === 'index.html') fs.writeFileSync(destino, estamparIndex(fs.readFileSync(origen, 'utf8'), id));
  else if (rel === 'sw.js') fs.writeFileSync(destino, estamparSw(fs.readFileSync(origen, 'utf8'), id));
  else fs.copyFileSync(origen, destino);
}
console.log('OK: dist/site (v' + id.version + ' · build ' + id.commit + ' · ' + id.fecha + ')');
