const CACHE_NAME = 'grade-fix-v1.3.1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Force this new service worker to become active immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Attempt to cache core assets
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        console.warn('Pre-caching failed:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately so the user doesn't need to reload twice
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Network First Strategy:
  // 1. Try to fetch from network (to get latest data/code)
  // 2. If successful, update cache and return
  // 3. If network fails (offline), return from cache
  
  // Skip non-GET requests (like POST to Google Sheets)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response because it's a stream and can only be consumed once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Cache resource (supports Basic and CORS for CDNs)
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // If offline, look in cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Optional: Return a specific offline page here if desired
          return new Response('Offline mode: Please connect to internet.');
        });
      })
  );
});