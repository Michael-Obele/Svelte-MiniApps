/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import {generateOfflineHtml} from './lib/utility/offlineTemplate';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `cache-${version}`;
const OFFLINE_URL = '/offline';
const OFFLINE_PAGE = generateOfflineHtml();
const ASSETS = [...build, ...files];

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
            const response = await fetch(asset);
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
  
  // Check if it's a navigation request or explicitly requesting HTML
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

// Helper function to generate offline response
async function generateOfflineResponse(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  
  // For API requests, return a JSON error response
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
  
  // For page requests, return the offline page
  const cachedOfflinePage = await cache.match(OFFLINE_URL);
  if (cachedOfflinePage) {
    return cachedOfflinePage;
  }
  
  // Fallback if cached version not found
  return new Response(OFFLINE_PAGE, {
    status: 200,
    headers: new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
  });
}

// Fetch handler
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Try the cache first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, try the network
        const response = await fetch(event.request);
        
        // Cache successful responses that aren't API calls
        if (response.ok && 
            response.type === 'basic' && 
            !isApiRequest(event.request)) {
          await cache.put(event.request, response.clone());
        }
        
        return response;
      } catch (error) {
        console.log('[Service Worker] Fetch failed:', event.request.url, error);
        
        // Return appropriate offline response based on request type
        return generateOfflineResponse(event.request);
      }
    })()
  );
});
