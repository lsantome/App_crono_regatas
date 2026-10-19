/* ============================================================
   Service Worker — Cronometraje de Regatas
   ------------------------------------------------------------
   Estrategia:
     · Navegación (el HTML): red primero, caché como respaldo.
       Así se recibe la última versión al abrir con cobertura y
       la app sigue funcionando sin red.
     · Resto de archivos (iconos, manifest): caché primero.
   CACHE_VERSION identifica la caché. Cada versión nueva debe
   cambiarlo para que los usuarios reciban la actualización.
   El despliegue por GitHub Actions lo sustituye automáticamente
   por el hash del commit; si publicas a mano, súbelo tú.
   ============================================================ */
const CACHE_VERSION = 'v1';
// El almacenamiento (Cache Storage, localStorage…) es COMÚN a todas las apps del mismo
// origen (p. ej. todos los repos de usuario.github.io). Por eso el prefijo es propio
// y la limpieza solo toca cachés de esta app.
const CACHE_PREFIX = 'regatas-cronometraje-';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
// Cachés de versiones anteriores de esta app, que usaban el prefijo antiguo «regatas-v1» / «regatas-<hash>»
const LEGACY_CACHE = /^regatas-(v\d+|[0-9a-f]{7})$/;

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
      // cache:'reload' ignora la caché HTTP del navegador: sin esto, una versión
      // nueva podría precachear copias antiguas que el servidor aún da por válidas
      .then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
      // Un archivo que falle no debe impedir la instalación del resto
      .catch(err => console.warn('[sw] precaché incompleta:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.filter(n => (n.startsWith(CACHE_PREFIX) || LEGACY_CACHE.test(n)) && n !== CACHE_NAME)
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
        // 'no-cache' = revalidar siempre con el servidor (respuesta 304 si no hay
        // cambios, así que es barato). Sin esto, la caché HTTP de GitHub Pages
        // puede servir el HTML antiguo durante minutos aunque ya haya uno nuevo.
        const fresh = await fetch(req, { cache: 'no-cache' });
        const cache = await caches.open(CACHE_NAME);
        if (fresh.ok && !fresh.redirected) cache.put('./index.html', fresh.clone());
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
