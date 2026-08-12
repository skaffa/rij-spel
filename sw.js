const CACHE_NAME = 'rijspel-zc-v2';
const ASSETS = [
    './',
    'index.html',
    'sw.js'
];

// Installeer Service Worker en sla bestanden agressief op in de cache
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Bestanden worden gecached voor festival offline-gebruik');
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activeer en gooi oude caches weg
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Oude cache verwijderd:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Cache First / Network Fallback strategie - Negeer GET parameters bij het matchen!
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
            // Geef direct terug uit cache indien beschikbaar (supersnel op het terrein!)
            if (cachedResponse) {
                return cachedResponse;
            }
            // Anders proberen op te halen via het netwerk
            return fetch(e.request).catch(() => {
                // Als zelfs dat faalt (netwerk plat), en het is de hoofdpagina, geef index.html
                if (e.request.mode === 'navigate') {
                    return caches.match('index.html');
                }
            });
        })
    );
});
