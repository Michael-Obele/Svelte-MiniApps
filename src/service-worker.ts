/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import { generateOfflineHtml } from './lib/utility/offlineTemplate';

declare const self: ServiceWorkerGlobalScope;

// Distinguish between dev and production environments
const IS_DEV = import.meta.env.DEV;

// Create a unique cache name that includes the full version
const CACHE_NAME = `app-cache-${version}`;
const ASSETS = [...build, ...files];
const OFFLINE_URL = '/offline';
const OFFLINE_PAGE = generateOfflineHtml();

// Increase cache duration for stability
const MAX_AGE = IS_DEV 
  ? 5 * 60 * 1000 // 5 minutes in dev
  : 24 * 60 * 60 * 1000; // 1 day in production

const VERSION_KEY = 'app-version';
const HASH_KEY = 'app-hash';
const HASH_FILE = '/service-worker-hash.json';

// Debugging and development mode helpers
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'DEBUG') {
    console.log('[Service Worker Debug]', event.data);
  }

  // More lenient hash checking in dev mode
  if (event.data && event.data.type === 'SKIP_WAITING') {
    if (IS_DEV) {
      // In dev mode, always skip waiting without hash check
      self.skipWaiting();
      return;
    }

    try {
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
          console.log('[Service Worker] Hash unchanged, skipping update.');
        }
      }
    } catch (error) {
      console.warn('[Service Worker] Hash check failed:', error);
    }
  }
});

// Installation process with improved dev mode handling
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // In dev mode, minimize caching and version checking
        if (IS_DEV) {
          console.log('[Service Worker] Dev mode: Minimal caching');
          // Cache only critical assets, skip complex versioning
          await cache.addAll([OFFLINE_URL]);
          return;
        }

        // Production-level caching and version checking
        console.log('[Service Worker] Caching assets for version:', version);
        
        // Version and hash management for production
        try {
          const hashResponse = await fetch(HASH_FILE);
          if (hashResponse.ok) {
            const hashData = await hashResponse.json();
            const newHash = hashData.hash;
            
            // Store hash and notify about version changes
            await cache.put(HASH_KEY, new Response(newHash));
            await cache.put(VERSION_KEY, new Response(version));
            
            // Notify clients about new version
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
              client.postMessage({ 
                type: 'NEW_VERSION_AVAILABLE', 
                hash: newHash 
              });
            });
          }
        } catch (error) {
          console.warn('[Service Worker] Hash fetch failed:', error);
        }
        
        // Cache static assets with more robust error handling
        const cachePromises = ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { 
              cache: 'reload',
              credentials: 'same-origin'
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
        });

        await Promise.all([
          ...cachePromises,
          // Always cache offline page
          cache.put(new Request(OFFLINE_URL), new Response(OFFLINE_PAGE, {
            headers: new Headers({
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
            })
          }))
        ]);

        console.log('[Service Worker] Installation complete');
      } catch (error) {
        console.error('[Service Worker] Installation failed:', error);
      }
    })()
  );
});

// Activation process with development mode considerations
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        // In dev mode, skip most activation logic
        if (IS_DEV) {
          await self.clients.claim();
          return;
        }

        // Production-level activation
        const cache = await caches.open(CACHE_NAME);
        const storedHashResponse = await cache.match(HASH_KEY);
        const storedHash = storedHashResponse ? await storedHashResponse.text() : null;
        
        try {
          const hashResponse = await fetch(HASH_FILE);
          if (hashResponse.ok) {
            const hashData = await hashResponse.json();
            if (storedHash !== hashData.hash) {
              console.log('[Service Worker] Hash changed, clearing old caches');
              
              // Delete all previous caches
              const cacheKeys = await caches.keys();
              await Promise.all(cacheKeys.map(key => caches.delete(key)));
              
              // Force clients to reload
              await self.clients.claim();
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                (client as any).navigate(client.url);
              });
            }
          }
        } catch (error) {
          console.warn('[Service Worker] Hash check failed:', error);
        }

        // Clean up old caches
        const keys = await caches.keys();
        await Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key.startsWith('app-cache-')) {
              return caches.delete(key);
            }
          })
        );
        
        await self.clients.claim();
        console.log('[Service Worker] Activation complete');
      } catch (error) {
        console.error('[Service Worker] Activation failed:', error);
      }
    })()
  );
});

// Fetch handling remains largely the same
self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Page request handling with network-first strategy
  if (isPageRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // In dev mode, always go to network
          if (IS_DEV) {
            return await fetch(request);
          }

          // Production network-first with fallback
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {
          console.log('[Service Worker] Network request failed, falling back to cache');
        }

        // Fall back to cache or offline page
        const cachedResponse = await caches.match(request);
        if (cachedResponse && cachedResponse.ok) {
          return cachedResponse;
        }

        const offlineResponse = await caches.match(OFFLINE_URL);
        return offlineResponse || new Response('Offline', { status: 503 });
      })()
    );
    return;
  }

  // API requests remain network-only
  if (isApiRequest(request)) {
    event.respondWith(fetch(request));
    return;
  }

  // Stale-while-revalidate for static assets
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

// Utility functions remain the same
function isPageRequest(request: Request): boolean {
  const url = new URL(request.url);
  return request.mode === 'navigate' || 
         (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html'));
}

function isApiRequest(request: Request): boolean {
  return request.url.includes('/api/');
}