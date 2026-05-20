const CACHE_NAME = 'alo-rfb-v1.2.1';
const ASSETS = [ './', './index.html', './manifest.json' ];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('script.google.com')) return;

  const isAppShell = event.request.mode === 'navigate' || event.request.url.endsWith('/index.html');
  if (isAppShell) {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});