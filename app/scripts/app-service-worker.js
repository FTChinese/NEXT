/* jshint ignore:start */


const cacheName = 'v3';

// Precache only if you have a known offline page.
// You can leave this empty safely.
const PRECACHE = []; // e.g. ['/app/offline.html']

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    if (PRECACHE.length) await cache.addAll(PRECACHE);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map(n => n !== cacheName && caches.delete(n)));
    await self.clients.claim();
  })());
});

// Helper: same-origin GETs only
const sameOriginGet = (req) => {
  try {
    const url = new URL(req.url);
    return req.method === 'GET' && url.origin === self.location.origin;
  } catch { return false; }
};

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1) HTML navigations: network-first with fallback to cache (or a tiny offline message)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(cacheName);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(req);
        if (cached) return cached;
        // As a last resort, simple offline response (remove if you add a real offline page)
        return new Response('You are offline.', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  // 2) Static assets under /powertranslate: cache-first (fast + offline)
  if (sameOriginGet(req)) {
    const url = new URL(req.url);

    if (url.pathname.startsWith('/powertranslate/')) {
      event.respondWith((async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        const resp = await fetch(req);
        if (resp && resp.status === 200) {
          const cache = await caches.open(cacheName);
          cache.put(req, resp.clone());
        }
        return resp;
      })());
      return;
    }
  }

  // 3) Everything else (same-origin GETs): network-first, then cache
  if (sameOriginGet(req)) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(cacheName);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        throw new Error('Offline and not cached');
      }
    })());
  }
});


/* jshint ignore:end */