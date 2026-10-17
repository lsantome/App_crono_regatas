/* ============================================================
   Service Worker — Cronometraje de Regatas
   ------------------------------------------------------------
   Estrategia:
     · Navegación (el HTML): red primero, caché como respaldo.
       Así se recibe la última versión al abrir con cobertura y
       la app sigue funcionando sin red.
     · Resto de archivos (iconos, manifest): caché primero.
   Al publicar una versión nueva, cambia CACHE_VERSION.
   ============================================================ */
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'regatas-' + CACHE_VERSION;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(PRECACHE))
      // Un archivo que falle no debe impedir la instalación del resto
      .catch(err => console.warn('[sw] precaché incompleta:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.filter(n => n.startsWith('regatas-') && n !== CACHE_NAME)
           .map(n => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // no tocar peticiones externas

  // --- Documento HTML: red primero ---
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match('./index.html');
        return cached || new Response(
          '<meta charset="utf-8"><h1>Sin conexión</h1><p>Abre la aplicación una vez con conexión para poder usarla sin red.</p>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  // --- Resto: caché primero, y se guarda lo que llegue de red ---
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      return new Response('', { status: 504 });
    }
  })());
});

// La página pide activar la versión nueva sin esperar
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
