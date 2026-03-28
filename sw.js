// PALE SIGNAL · Service Worker v2.14
// Cache-first. Full offline. Single repo.
// v2.14 — chemistry launchChem filename fix (v1_2→v1_1), TCG EchoArt window.PalePixel guard fix.
const CACHE = 'pale-signal-v2.14';
const VERSION = '2.14';

const CORE = [
  './index.html',
  './PaleSignalRPG-v3_12.html',
  './PaleSignalTCG-v1_2.html',
  './pixel-engine-v1_2.html',
  './chemistry-v1_1.html',
  './lib/pale-pixel.js',
  './manifest.json',
  './sw.js',
];

const FONTS = [
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled([
        ...CORE.map(url =>
          cache.add(url).catch(err => console.warn('[SW] skip core', url, err.message))
        ),
        ...FONTS.map(url =>
          cache.add(url).catch(() => console.warn('[SW] fonts not cached (offline at install)'))
        ),
      ])
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
      .then(() => {
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client =>
            client.postMessage({ type: 'SW_UPDATED', version: VERSION })
          );
        });
      })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (url.href.includes('web-llm') || url.href.includes('mlc-ai')) return;

  if (url.pathname === '/' || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => {
          if (e.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached || new Response('', { status: 503 }));
      })
    );
  }
});
