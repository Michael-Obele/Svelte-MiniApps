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
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

console.log('[Service Worker] Initializing with:', {
  version,
  cacheKey: CACHE_NAME,
  totalAssets: ASSETS.length
});

// Install service worker and cache files
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');
  
  // Don't skip waiting to avoid sudden reloads
  // self.skipWaiting();
  
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
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      
      // Claim clients only after cleanup
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
        
        // Start fetching from network in background
        const networkPromise = fetch(event.request.clone()).then(async response => {
          if (response.ok && !isApiRequest(event.request)) {
            try {
              await cache.put(event.request, response.clone());
            } catch (error) {
              console.warn('[Service Worker] Failed to cache:', error);
            }
          }
          return response;
        }).catch(error => {
          console.warn('[Service Worker] Network fetch failed:', error);
          throw error;
        });

        // If we have a cached response
        if (cachedResponse) {
          // If it's an API request or the cache is stale, try network first
          if (isApiRequest(event.request) || isCacheStale(cachedResponse)) {
            try {
              return await networkPromise;
            } catch (error) {
              console.log('[Service Worker] Falling back to cache for:', event.request.url);
              return cachedResponse;
            }
          }
          // Otherwise return cached response immediately
          return cachedResponse;
        }

        // If no cache, try network
        try {
          return await networkPromise;
        } catch (error) {
          // If network fails and we have no cache, return offline response
          console.log('[Service Worker] No cache available, returning offline response for:', event.request.url);
          return generateOfflineResponse(event.request);
        }
      } catch (error) {
        console.error('[Service Worker] Fetch handler error:', error);
        return generateOfflineResponse(event.request);
      }
    })()
  );
});
