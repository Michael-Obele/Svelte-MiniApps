/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import {generateOfflineHtml} from './lib/utility/offlineTemplate';

declare const self: ServiceWorkerGlobalScope;

// Create a more stable cache name that doesn't change with every deployment
const CACHE_NAME = `app-cache-${version.split('.')[0]}`; // Only use major version
const OFFLINE_URL = '/offline';
const OFFLINE_PAGE = generateOfflineHtml();
const ASSETS = [...build, ...files];

// Maximum age of cached responses
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Debug logging
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'DEBUG') {
    console.log('[Service Worker Debug]', event.data);
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
        console.log('[Service Worker] Caching all assets:', ASSETS);
        
        // Cache all static assets
        const cachePromises = [
          // Cache the offline page
          cache.put(new Request(OFFLINE_URL), new Response(OFFLINE_PAGE, {
            headers: new Headers({
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
            })
          })),
          // Cache other assets
          ...ASSETS.map(async (asset) => {
            try {
              const response = await fetch(asset, { 
                cache: 'reload',
                credentials: 'same-origin'
              });
              if (response.ok) {
                await cache.put(asset, response);
              }
            } catch (error) {
              console.warn(`Failed to cache asset: ${asset}`, error);
            }
          })
        ];

        await Promise.all(cachePromises);
        console.log('[Service Worker] Installation complete');
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
        // Clean up old caches
        const keys = await caches.keys();
        await Promise.all(
          keys.map((key) => {
            // Only delete caches that don't match our current cache name
            if (key !== CACHE_NAME && key.startsWith('app-cache-')) {
              console.log('[Service Worker] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
        
        // Claim clients only after cleanup
        await self.clients.claim();
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
  const acceptHeader = request.headers.get('Accept') || '';
  
  return request.mode === 'navigate' ||
         acceptHeader.includes('text/html') ||
         acceptHeader.includes('application/xhtml+xml') ||
         url.pathname.endsWith('/') ||
         url.pathname.endsWith('.html');
}

// Helper function to check if request is an API request
function isApiRequest(request: Request): boolean {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         (request.headers.get('Accept') || '').includes('application/json');
}

// Helper function to check if request is for offline page
function isOfflinePage(request: Request): boolean {
  const url = new URL(request.url);
  return url.pathname === OFFLINE_URL;
}

// Helper function to check if cache is stale
function isCacheStale(response: Response): boolean {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false; // Changed to false to prefer cache when date is unknown
  
  const age = Date.now() - new Date(dateHeader).getTime();
  return age > MAX_AGE;
}

// Helper function to generate offline response
async function generateOfflineResponse(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  
  if (isApiRequest(request)) {
    return new Response(JSON.stringify({
      error: 'You are currently offline',
      status: 'offline'
    }), {
      status: 503,
      headers: new Headers({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      })
    });
  }
  
  const cachedOfflinePage = await cache.match(OFFLINE_URL);
  if (cachedOfflinePage) {
    return cachedOfflinePage;
  }
  
  return new Response(OFFLINE_PAGE, {
    status: 200,
    headers: new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
  });
}

// Fetch handler with stale-while-revalidate strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Skip service worker for certain requests
  if (
    url.pathname.startsWith('/browser-sync/') ||
    url.pathname.startsWith('chrome-extension://') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Try the cache first
        const cachedResponse = await cache.match(event.request);
        
        // For offline page, use network-first strategy with aggressive checking
        if (isOfflinePage(event.request)) {
          try {
            const networkResponse = await fetch(event.request.clone());
            if (networkResponse.ok) {
              await cache.put(event.request, networkResponse.clone());
              return networkResponse;
            }
          } catch (error) {
            if (cachedResponse) return cachedResponse;
            throw error;
          }
        }
        
        // For API requests, use network-first with cache fallback
        if (isApiRequest(event.request)) {
          try {
            const networkResponse = await fetch(event.request.clone());
            if (networkResponse.ok) {
              await cache.put(event.request, networkResponse.clone());
              return networkResponse;
            }
          } catch (error) {
            if (cachedResponse) return cachedResponse;
            throw error;
          }
        }

        // For all other requests, use cache-first strategy
        if (cachedResponse) {
          // Only fetch from network if cache is stale, and do it in the background
          if (isCacheStale(cachedResponse)) {
            fetch(event.request.clone())
              .then(async response => {
                if (response.ok) {
                  await cache.put(event.request, response.clone());
                }
              })
              .catch(error => console.warn('[Service Worker] Background fetch failed:', error));
          }
          return cachedResponse;
        }

        // If no cache, try network
        const networkResponse = await fetch(event.request.clone());
        if (networkResponse.ok) {
          await cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }
        
        throw new Error('No cache or network response available');
      } catch (error) {
        console.error('[Service Worker] Fetch handler error:', error);
        return generateOfflineResponse(event.request);
      }
    })()
  );
});
