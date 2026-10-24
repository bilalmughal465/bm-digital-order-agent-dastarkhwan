/* Sara Agent v4 — service worker: single page + manifest + logo ko cache karo.
   Koi file na mile to install fail nahi hoga (allSettled), aur page hamesha
   network se bhi khul sakega. */
const CACHE = 'sara-agent-v4';
const FILES = [
  './ai-calling-agent-v4-ui.html',
  './ai-calling-agent-manifest.json',
  './ai-agent-logo.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(FILES.map((f) => cache.add(f)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        if (res.ok && new URL(event.request.url).origin === location.origin) {
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match('./ai-calling-agent-v4-ui.html'));
    })
  );
});
