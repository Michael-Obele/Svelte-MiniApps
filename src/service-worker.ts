/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import {generateOfflineHtml} from './lib/utility/offlineTemplate';

declare const self: ServiceWorkerGlobalScope;

// Create a unique cache name that includes the full version
const CACHE_NAME = `app-cache-${version}`;
const ASSETS = [...build, ...files];
const OFFLINE_URL = '/offline';
const OFFLINE_PAGE = generateOfflineHtml();

// Reduce cache duration to 1 day for better updates
const MAX_AGE = 24 * 60 * 60 * 1000; // 1 day

// Store the current version and hash in cache for comparison
const VERSION_KEY = 'app-version';
const HASH_KEY = 'app-hash';
const HASH_FILE = '/service-worker-hash.json';

// Debug logging
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'DEBUG') {
    console.log('[Service Worker Debug]', event.data);
  }
  // Handle cache invalidation message
  if (event.data && event.data.type === 'SKIP_WAITING') {
    const hashResponse = await fetch(HASH_FILE);
    if (hashResponse.ok) {
      const hashData = await hashResponse.json();
      const cache = await caches.open(CACHE_NAME);
      const storedHashResponse = await cache.match(HASH_KEY);
      const storedHash = storedHashResponse ? await storedHashResponse.text() : null;
      const newHash = hashData.hash;
      if (newHash !== storedHash) {
        self.skipWaiting();
      } else {
        console.log('[Service Worker] Hash has not changed, skipping SKIP_WAITING message.');
      }
    }
  }
});

console.log('[Service Worker] Initializing with:', {
  version,
  cacheKey: CACHE_NAME,
  totalAssets: ASSETS.length
});

// Install service worker and cache files
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Caching all assets for version:', version);
        
        // Fetch and store the current hash
        try {
          const hashResponse = await fetch(HASH_FILE);
          if (hashResponse.ok) {
            const hashData = await hashResponse.json();
            const storedHashResponse = await cache.match(HASH_KEY);
            const storedHash = storedHashResponse ? await storedHashResponse.text() : null;
            const newHash = hashData.hash;
            const currentHash = storedHash;
            if (newHash !== currentHash) {
              // Notify user about the new version
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
                });
              });
            } else {
              console.log('[Service Worker] Hash has not changed, discarding new service worker.');
            }
            await cache.put(HASH_KEY, new Response(hashData.hash));
          }
        } catch (error) {
          console.warn('[Service Worker] Failed to fetch hash:', error);
        }
        
        // Store the current version
        await cache.put(VERSION_KEY, new Response(version));
        
        // Cache all static assets
        const cachePromises = [
          // Cache the offline page
          cache.put(new Request(OFFLINE_URL), new Response(OFFLINE_PAGE, {
            headers: new Headers({
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
            })
          })),
          // Cache other assets with no-cache directive
          ...ASSETS.map(async (asset) => {
            try {
              const response = await fetch(asset, { 
                cache: 'reload',
                credentials: 'same-origin',
                headers: {
                  'Cache-Control': 'no-cache'
                }
              });
              if (response.ok) {
                const cacheResponse = response.clone();
                const headers = new Headers(cacheResponse.headers);
                headers.set('Cache-Control', `max-age=${MAX_AGE}`);
                const modifiedResponse = new Response(await cacheResponse.blob(), {
                  status: cacheResponse.status,
                  statusText: cacheResponse.statusText,
                  headers
                });
                await cache.put(asset, modifiedResponse);
              }
            } catch (error) {
              console.warn(`Failed to cache asset: ${asset}`, error);
            }
          })
        ];

        await Promise.all(cachePromises);
        console.log('[Service Worker] Installation complete for version:', version);
      } catch (error) {
        console.error('[Service Worker] Installation failed:', error);
      }
    })()
  );
});

// Activate the new service worker and remove old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        // Check if the service worker is already controlling clients
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
          console.log('[Service Worker] Already controlling clients, skipping activation.');
          return;
        }
        
        // Check if hash has changed
        const cache = await caches.open(CACHE_NAME);
        const storedHashResponse = await cache.match(HASH_KEY);
        const storedHash = storedHashResponse ? await storedHashResponse.text() : null;
        
        try {
          const hashResponse = await fetch(HASH_FILE);
          if (hashResponse.ok) {
            const hashData = await hashResponse.json();
            if (storedHash !== hashData.hash) {
              console.log('[Service Worker] Hash changed, clearing caches');
              // Delete all caches
              const cacheKeys = await caches.keys();
              await Promise.all(cacheKeys.map(key => caches.delete(key)));
              // Force clients to reload to get new version
              await self.clients.claim();
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                (client as any).navigate(client.url);
              });
            }
          }
        } catch (error) {
          console.warn('[Service Worker] Failed to check hash:', error);
        }

        // Immediately claim clients to ensure the new service worker takes over
        await self.clients.claim();
        
        // Clean up old caches
        const keys = await caches.keys();
        await Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key.startsWith('app-cache-')) {
              console.log('[Service Worker] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
        
        console.log('[Service Worker] Activation complete');
      } catch (error) {
        console.error('[Service Worker] Activation failed:', error);
      }
    })()
  );
});

// Helper function to check if request is for a page
function isPageRequest(request: Request): boolean {
  const url = new URL(request.url);
  return request.mode === 'navigate' || 
         (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html'));
}

// Helper function to check if request is an API request
function isApiRequest(request: Request): boolean {
  return request.url.includes('/api/');
}

// Helper function to check if cache is stale
function isCacheStale(response: Response): boolean {
  const cacheDate = new Date(response.headers.get('date') || '');
  const age = Date.now() - cacheDate.getTime();
  return age > MAX_AGE;
}

// Fetch handler with network-first strategy for pages and stale-while-revalidate for assets
self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle page requests with network-first strategy
  if (isPageRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {
          console.log('[Service Worker] Network request failed, falling back to cache');
        }

        // Fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse && cachedResponse.ok) {
          return cachedResponse;
        }

        // If both network and cache fail, return offline page
        const offlineResponse = await caches.match(OFFLINE_URL);
        return offlineResponse || new Response('Offline', { status: 503 });
      })()
    );
    return;
  }

  // Handle API requests with network-only strategy
  if (isApiRequest(request)) {
    event.respondWith(fetch(request));
    return;
  }

  // Handle static assets with stale-while-revalidate strategy
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);

      const networkFetch = fetch(request).then(async (networkResponse) => {
        if (networkResponse.ok) {
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      });

      return cachedResponse && cachedResponse.ok ? cachedResponse : networkFetch;
    })()
  );
});
