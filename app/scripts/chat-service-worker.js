/* jshint ignore:start */


const cacheName = 'v343';
console.log(`CACHE_NAME: ${cacheName}`);
const URLS = [
    '/powertranslate/chat.html',
    '/powertranslate/styles/main-chat.css',
    '/powertranslate/scripts/main-chat.js'
];

// Respond with cached resources
self.addEventListener('fetch',  e => {
    // console.log(`service worker: fetching at ${cacheName}`);
    e.respondWith(
        caches.match(e.request).then( (request) => {
            return request || fetch(e.request);
        })
    );
});

// Cache resources
self.addEventListener('install',  e => {
    console.log(`service worker: installed at ${cacheName}`);
    e.waitUntil(
    caches
        .open(cacheName)
        .then(function (cache) {
            console.log(`Add Caches ${cacheName} of ${URLS.length} Urls: `);
            cache.addAll(URLS);
        })
        .then(() => self.skipWaiting())
    );
});

// Delete outdated caches
self.addEventListener('activate', e => {
    console.log(`service worker: activated at ${cacheName}`);
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== cacheName) {
                        console.log(`Deleting cache: ${cache}`);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

/* jshint ignore:end */