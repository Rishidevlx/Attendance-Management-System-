// client/public/service-worker.js

// Import Workbox libraries
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Ensure Workbox is loaded
if (!workbox) {
  console.error(`Workbox failed to load. PWA features will not work.`);
} else {
  console.log(`Workbox loaded successfully!`);

  // --- 1. Service Worker Activation & Stability Fix ---
  // Activate the Service Worker immediately without waiting for user close.
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  // Ensure the Service Worker controls all pages immediately after activation.
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });


  // --- 2. App Shell Caching (Cache First) ---
  // Cache the core app shell (HTML, CSS, JS bundles) and prioritize it.
  workbox.routing.registerRoute(
    ({ request, url }) => url.pathname === '/' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.includes('/src/'),
    new workbox.strategies.CacheFirst({
      cacheName: 'app-shell-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
        }),
      ],
    })
  );

  // Cache static assets (images, fonts, spline models)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image' || request.destination === 'font',
    new workbox.strategies.CacheFirst({
      cacheName: 'static-assets-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache Manifest file itself (optional but helps stability)
  workbox.routing.registerRoute(
    ({ url }) => url.pathname === '/manifest.json',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'manifest-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 1,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
    })
  );


  // --- 3. API Data Caching (Stale While Revalidate - PWA Lite Focus) ---
  // Performance caching for read-only data (History, Reports, Info)
  workbox.routing.registerRoute(
    ({ url, request }) => (url.pathname.startsWith('/api/attendance/history') ||
                           url.pathname.startsWith('/api/attendance/late-history') ||
                           url.pathname.startsWith('/api/info')) && request.method === 'GET',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'api-data-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
    })
  );

  // --- 4. Network Only for Write Operations (PWA Lite - NO OFFLINE SYNC) ---
  // All other API calls (POST, PUT, DELETE - Check-in, Leave, Admin Actions) MUST be network only.
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkOnly()
  );
}
