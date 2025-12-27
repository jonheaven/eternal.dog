// Service Worker for Eternal Dog PWA
const CACHE_NAME = 'eternal-dog-v1';
const RUNTIME_CACHE = 'eternal-dog-runtime-v1';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/gallery',
  '/upload',
  '/assets/wizard-dog.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE
            );
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  return self.clients.claim(); // Take control of all pages
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (APIs, etc.)
  if (url.origin !== location.origin && !url.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            // Only cache GET requests for same origin
            if (request.method === 'GET' && url.origin === location.origin) {
              cache.put(request, responseToCache);
            }
          });

          return response;
        })
        .catch(() => {
          // If network fails and it's a navigation request, return offline page
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-gallery') {
    event.waitUntil(syncGallery());
  }
});

async function syncGallery() {
  // Future: Sync gallery data when back online
  console.log('Syncing gallery data...');
}

