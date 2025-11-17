/* jshint esversion: 11 */
/* global self, caches, fetch, Response */

const cacheName = 'v42';
const LOG_PREFIX = '[SW ' + cacheName + ']';
console.log(LOG_PREFIX + ' loaded');

// ---- Precache (optional/offline bootstrap) ----
const START_URL = '/app';
const PRECACHE = [
  START_URL,
  '/powertranslate/styles/main-app.css',
  '/powertranslate/scripts/main-app.js',
  '/powertranslate/scripts/register.js',
  '/powertranslate/scripts/app-load-quiz.js'
];

// Endpoints we should NEVER cache (auth/state, etc.)
const NO_CACHE_PREFIXES = [
  '/checklogin',
  '/check_preference'
];

// JSON endpoints we DO want to cache (SWR)
const JSON_CACHE_PREFIXES = [
  '/api/story/',
  '/api/interactive/',
  '/api/content/'
];

// ---- Helpers ----
function sameOriginGet(req) {
  try {
    const url = new URL(req.url);
    return req.method === 'GET' && url.origin === self.location.origin;
  } catch (e) {
    return false;
  }
}

// Cache HTML for these navigation paths: "/", "/channel/*", "/m/*", "/tag/*"
function htmlPathShouldBeCached(pathname) {
  if (pathname === '/') { return true; }
  return (
    pathname.indexOf('/channel/') === 0 ||
    pathname.indexOf('/m/') === 0 ||
    pathname.indexOf('/tag/') === 0
  );
}

// Programmatic HTML fetch detector
function isHtmlRequest(req) {
  try {
    var accept = req.headers && req.headers.get('accept');
    return !!(accept && accept.indexOf('text/html') !== -1);
  } catch (e) {
    return false;
  }
}

// Basic static assets (cacheable in network-first block)
function isStaticAsset(pathname) {
  return /\.(?:css|js|png|jpe?g|svg|webp|ico|json|woff2?|ttf|otf|mp3|mp4|webm|wasm)$/.test(pathname);
}

function shouldBypassCache(pathname) {
  return NO_CACHE_PREFIXES.some(function (p) {
    return pathname.indexOf(p) === 0;
  });
}

function isJsonEndpoint(pathname) {
  return JSON_CACHE_PREFIXES.some(function (p) {
    return pathname.indexOf(p) === 0;
  });
}

function log() {
  console.log.apply(console, [LOG_PREFIX].concat([].slice.call(arguments)));
}

// ---- SWR for JSON endpoints (single fetch on cold start, background refresh thereafter) ----
async function swrJson(event, req, pathname) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  if (cached) {
    // Serve cached immediately, refresh in background
    event.waitUntil((async function () {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok && fresh.type === 'basic') {
          var ct = fresh.headers && fresh.headers.get('content-type') || '';
          if (ct.indexOf('application/json') !== -1) {
            await cache.put(req, fresh.clone());
            log('json SWR UPDATE:', pathname);
          } else {
            log('json SWR SKIP update (non-JSON):', pathname);
          }
        } else {
          log('json SWR SKIP update (bad response):', pathname);
        }
      } catch (e) {
        log('json SWR update failed:', pathname, e && e.message);
      }
    })());

    log('json SWR HIT (serve cache now):', pathname);
    return cached;
  }

  // Cold start: single network fetch, then cache
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok && fresh.type === 'basic') {
      var ctPrime = fresh.headers && fresh.headers.get('content-type') || '';
      if (ctPrime.indexOf('application/json') !== -1) {
        await cache.put(req, fresh.clone());
        log('json SWR PUT (primed):', pathname);
      } else {
        log('json SWR SKIP prime (non-JSON):', pathname);
      }
    } else {
      log('json SWR SKIP prime (bad response):', pathname);
    }
    return fresh;
  } catch (e) {
    return new Response('Offline and JSON not cached.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}


// ---- Install ----
self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    const cache = await caches.open(cacheName);
    if (PRECACHE.length) {
      try {
        await cache.addAll(PRECACHE);
        log('precache complete:', PRECACHE);
      } catch (e) {
        log('precache error:', e && e.message);
      }
    }
    await self.skipWaiting();
    log('install finished');
  })());
});

// ---- Activate ----
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const names = await caches.keys();
    await Promise.all(names.map(function (n) {
      if (n !== cacheName) {
        log('deleting old cache:', n);
        return caches.delete(n);
      }
      return Promise.resolve(true);
    }));
    await self.clients.claim();
    log('activate finished');
  })());
});

// ---- Fetch routing ----
self.addEventListener('fetch', function (event) {
  const req = event.request;

  if (!sameOriginGet(req)) {
    return;
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  log('fetch:', pathname);

  // 0) JSON endpoints: stale-while-revalidate
  if (isJsonEndpoint(pathname)) {
    if (shouldBypassCache(pathname)) {
      event.respondWith(fetch(req));
      log('json BYPASS (NO_CACHE_PREFIXES matched):', pathname);
      return;
    }
    event.respondWith(swrJson(event, req, pathname));
    return;
  }

  // 1) HTML navigations: network-first with cache write (only for selected paths)
  if (req.mode === 'navigate') {
    event.respondWith((async function () {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok && fresh.type === 'basic' && htmlPathShouldBeCached(pathname)) {
          const cache = await caches.open(cacheName);
          await cache.put(req, fresh.clone());
          log('nav cached:', pathname);
        } else {
          log('nav not cached (not eligible):', pathname);
        }
        return fresh;
      } catch (e) {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(req);
        if (cached) { return cached; }

        // TODO(offline): friendly offline HTML page (e.g. START_URL)
        return new Response('You are offline.', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // 1b) Programmatic HTML fetches
  if (isHtmlRequest(req) && htmlPathShouldBeCached(pathname)) {
    event.respondWith((async function () {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok && fresh.type === 'basic') {
          const cache = await caches.open(cacheName);
          await cache.put(req, fresh.clone());
          log('html-fetch cached:', pathname);
        } else {
          log('html-fetch not cached (not eligible):', pathname);
        }
        return fresh;
      } catch (e) {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(req);
        if (cached) { return cached; }

        // TODO(offline): friendly HTML page
        return new Response('You are offline.', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // 2) Static assets under /powertranslate: cache-first
  if (pathname.indexOf('/powertranslate/') === 0) {
    event.respondWith((async function () {
      const hit = await caches.match(req);
      if (hit) {
        log('cache-first HIT:', pathname);
        return hit;
      }
      const resp = await fetch(req);
      if (resp && resp.ok && resp.type === 'basic') {
        const cache = await caches.open(cacheName);
        await cache.put(req, resp.clone());
        log('cache-first PUT:', pathname);
      } else {
        log('cache-first SKIP (not cacheable):', pathname);
      }
      return resp;
    })());
    return;
  }

  // 3) Everything else: network-first with guarded cache writes
  event.respondWith((async function () {
    try {
      const fresh = await fetch(req);

      if (fresh && fresh.ok && fresh.type === 'basic') {
        if (shouldBypassCache(pathname)) {
          log('no-cache BYPASS (no write):', pathname);
        } else if (isStaticAsset(pathname)) {
          const cache = await caches.open(cacheName);
          await cache.put(req, fresh.clone());
          log('network-first PUT (asset):', pathname);
        } else {
          log('network-first SKIP (non-asset):', pathname);
        }
      } else {
        log('network-first SKIP (bad response):', pathname);
      }

      return fresh;
    } catch (e) {
      const cached = await caches.match(req);
      if (cached) {
        log('network-first FALLBACK (cache):', pathname);
        return cached;
      }
      return new Response('Offline and not cached.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
