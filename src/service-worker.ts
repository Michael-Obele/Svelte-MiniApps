/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import {generateOfflineHtml}  from './lib/utility/offlineTemplate';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `cache-${version}`;
const ASSETS = [...build, ...files];

// Add HTML content types that should show the offline page
const HTML_CONTENT_TYPES = [
  'text/html',
  'application/xhtml+xml'
];

console.log('[Service Worker] Initializing with:', {
  version,
  cacheKey: CACHE_NAME,
  totalAssets: ASSETS.length
});

// Install service worker and cache files
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets:', ASSETS);
      return cache.addAll(ASSETS).then(() => {
        console.log('[Service Worker] All assets cached successfully');
      });
    })
  );
});

// Activate the new service worker and remove old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      console.log('[Service Worker] Found caches:', keys);
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          })
      ).then(() => {
        console.log('[Service Worker] Activation complete');
      });
    })
  );
});

// Helper function to determine if a request is for an HTML page
function isHtmlRequest(request: Request): boolean {
  const acceptHeader = request.headers.get('Accept') || '';
  return HTML_CONTENT_TYPES.some(type => acceptHeader.includes(type));
}

// Helper function to serve offline page
function serveOfflinePage() {
  const offlineHtml = generateOfflineHtml();
  return new Response(offlineHtml, {
    status: 200,
    headers: new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    })
  });
}

// Fetch from cache or fall back to the network
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Fetching resource:', event.request.url);

      try {
        // Try the cache first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          console.log('[Service Worker] Found in cache:', event.request.url);
          return cachedResponse;
        }

        // If not in cache, try the network
        const response = await fetch(event.request);
        console.log('[Service Worker] Network fetch:', event.request.url, response.status);

        // Cache successful responses
        if (response.ok && response.type === 'basic') {
          console.log('[Service Worker] Caching new resource:', event.request.url);
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        
        // For non-HTML requests, try to return a cached version first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          console.log('[Service Worker] Serving cached version for offline request');
          return cachedResponse;
        }

        // If no cached version exists or for any failed request, return the offline page
        console.log('[Service Worker] Serving offline page');
        return serveOfflinePage();
      }
    })()
  );
});
