const CACHE = 'hochzeitsplaner-v20';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  // Skip waiting = activate immediately, don't wait for old tabs to close
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Delete ALL old caches immediately
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Auf SKIP_WAITING Nachricht reagieren
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Network-First: always try fresh content, fall back to cache only if offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
