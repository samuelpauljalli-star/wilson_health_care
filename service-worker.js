const CACHE_NAME = 'wilson-hc-v3';
const ASSETS = [
    './',
    './index.html',
    './peter.html',
    './product-detail.html',
    './firebase-config.js',
    './data.js',
    './logo.jpg'
];

// Install — skip waiting so new SW activates immediately
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activate — delete ALL old caches (v1, v2, etc.)
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => {
                    console.log('[SW] Deleting old cache:', k);
                    return caches.delete(k);
                })
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch — Network-first for HTML/JS (always fresh), Cache-first for images/fonts
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    const isCodeFile = url.pathname.endsWith('.html')
        || url.pathname.endsWith('.js')
        || url.pathname === '/';

    if (isCodeFile) {
        // Always fetch fresh from network, update cache in background
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                    return res;
                })
                .catch(() => caches.match(e.request)) // offline fallback
        );
    } else {
        // Cache-first for images, fonts, etc.
        e.respondWith(
            caches.match(e.request)
                .then(res => res || fetch(e.request))
        );
    }
});

