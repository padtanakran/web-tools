/**
 * sw.js — Tools Hub Service Worker
 * Strategy: Cache-First for the entire app shell.
 * Falls back to offline.html for uncached navigation requests.
 *
 * HOW TO UPDATE: bump CACHE_NAME whenever you add/change files.
 */

const CACHE_NAME = 'tools-hub-v2';

// All resources that must be available offline after first load.
const PRECACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/common.js',
  './assets/js/app.js',
  './assets/icons/icon-192.jpg',
  './assets/icons/icon-512.jpg',
  './data/tools.json',
  './data/foods.json',
  './data/categories.json',
  './tools/price-comparison.html',
  './tools/value-calculator.html',
  './tools/random-food.html',
  './tools/percentage-calc.html',
  './tools/unit-converter.html',
  './tools/random-choice.html',
  './tools/finance-calc.html',
  './tools/text-utils.html',
  './tools/everyday-utils.html',
];

/* ---- Install: pre-cache all shell resources ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  // Take control immediately — don't wait for old SW to be gone
  self.skipWaiting();
});

/* ---- Activate: clean up old caches ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // Take control of all open clients
  self.clients.claim();
});

/* ---- Fetch: Cache-First strategy ---- */
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Only handle same-origin requests (no external CDNs)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      // Not in cache — try network
      return fetch(request).then(networkResponse => {
        // Cache the new response for next time
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
        }
        return networkResponse;
      }).catch(() => {
        // Network failed — show offline fallback for navigation requests
        if (request.destination === 'document') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
