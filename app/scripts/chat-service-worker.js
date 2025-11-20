/* jshint ignore:start */


const cacheName = 'v2734';
console.log(`CACHE_NAME: ${cacheName}`);
const domain = 'https://ftcoffer.herokuapp.com';
const startUrl = '/powertranslate/chat.html';
const URLS = [
    startUrl,
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


self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Recieved...");
    console.log(data);
    self.registration.showNotification(data.title, {
      body: data.body || '',
      icon: data.icon || '',
      vibrate: data.vibrate || '',
      data: data
    });
});

// MARK: - Handle user interaction with notifications

self.addEventListener("notificationclick", async (event) => {
    console.log("On notification click: ", event.notification.tag);
    event.notification.close();
    const data = event.notification.data;
    console.log(`Handle notification click with data: `);
    console.log(data);
    
    // This looks to see if the current is already open and
    // focuses if it is
    const url = data.from + startUrl;
    console.log(`Look for url: ${url}`);
    try {
        await event.waitUntil(
            clients
                .matchAll({type: 'window',})
                .then((clientList) => {
                    for (const client of clientList) {
                        if (client.url === url && 'focus' in client) {
                            client.focus();
                            client.postMessage({ name: 'webpush', data: data });
                            return;
                        }
                    }
                    if (clients.openWindow) {
                        clients
                            .openWindow(url)
                            .then((client) => {
                                client.postMessage({ name: 'webpush', data: data });
                            });
                    }
                }),
        );
    } catch(err) {
        console.log('notificationclick error: ');
        console.log(err);
    }
});

// TODO: - Save artiles to IndexedDB

/* jshint ignore:end */