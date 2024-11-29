/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import {generateOfflineHtml} from './lib/utility/offlineTemplate';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `cache-${version}`;
const OFFLINE_URL = '/offline';
const OFFLINE_PAGE = generateOfflineHtml();
const ASSETS = [...build, ...files];

// Maximum age of cached responses
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

console.log('[Service Worker] Initializing with:', {
  version,
  cacheKey: CACHE_NAME,
  totalAssets: ASSETS.length
});

// Install service worker and cache files
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Caching all assets:', ASSETS);
      
      // Cache all static assets
      await Promise.all([
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
            const response = await fetch(asset, { cache: 'reload' });
            if (response.ok) {
              await cache.put(asset, response);
            }
          } catch (error) {
            console.warn(`Failed to cache asset: ${asset}`, error);
          }
        })
      ]);

      console.log('[Service Worker] Installation complete');
    })()
  );
});

// Activate the new service worker and remove old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    (async () => {
      // Delete old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

      // Take control of all clients immediately
      await self.clients.claim();
      console.log('[Service Worker] Activation complete');
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
  return url.pathname.includes('/api/') || 
         (request.headers.get('Accept') || '').includes('application/json');
}

// Helper function to check if cache is stale
function isCacheStale(response: Response): boolean {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  
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

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Try the cache first
        const cachedResponse = await cache.match(event.request);
        
        // Start fetching from network in background
        const networkPromise = fetch(event.request).then(async response => {
          if (response.ok && !isApiRequest(event.request)) {
            await cache.put(event.request, response.clone());
          }
          return response;
        });

        // If we have a cached response
        if (cachedResponse) {
          // If it's an API request or the cache is stale, wait for network
          if (isApiRequest(event.request) || isCacheStale(cachedResponse)) {
            try {
              return await networkPromise;
            } catch (error) {
              return cachedResponse;
            }
          }
          // Otherwise return cached response immediately
          return cachedResponse;
        }

        // If no cache, wait for network
        return await networkPromise;
      } catch (error) {
        console.log('[Service Worker] Fetch failed:', event.request.url, error);
        return generateOfflineResponse(event.request);
      }
    })()
  );
});
