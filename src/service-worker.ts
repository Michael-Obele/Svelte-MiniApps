/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const IS_DEV = import.meta.env.DEV;
const CACHE_NAME = `app-cache-${version}`;
const ASSETS = [...build, ...files];
const OFFLINE_URL = '/offline';
const HASH_FILE = '/service-worker-hash.json';

// Cache duration
const MAX_AGE = IS_DEV
	? 5 * 60 * 1000 // 5 minutes in dev
	: 24 * 60 * 60 * 1000; // 1 day in production

// Handle messages
self.addEventListener('message', async (event) => {
	if (event.data?.type === 'DEBUG') {
		console.log('[Service Worker Debug]', event.data);
	}

	if (event.data?.type === 'SKIP_WAITING') {
		if (IS_DEV) {
			self.skipWaiting();
			return;
		}

		// In the activate event listener
		try {
			const hashResponse = await fetch(HASH_FILE);
			if (hashResponse.ok) {
				const hashData = await hashResponse.json();
				const cache = await caches.open(CACHE_NAME);
				const storedHashResponse = await cache.match('app-hash');
				const storedHash = storedHashResponse ? await storedHashResponse.text() : null;
				const clientStoredHash = localStorage.getItem('serviceWorkerHash');

				// Check both cache and localStorage hash to ensure we really need to update
				if (storedHash !== hashData.hash && clientStoredHash !== hashData.hash) {
					console.log('[Service Worker] Hash changed, notifying clients');
					const clients = await self.clients.matchAll();
					clients.forEach((client) => {
						client.postMessage({
							type: 'NEW_VERSION_AVAILABLE',
							hash: hashData.hash
						});
					});
				}
			}
		} catch (error) {
			console.warn('[Service Worker] Hash check failed:', error);
		}
	}
});

// Installation
self.addEventListener('install', (event: ExtendableEvent) => {
	console.log('[Service Worker] Installing...');

	event.waitUntil(
		(async () => {
			try {
				const cache = await caches.open(CACHE_NAME);

				// In dev mode, only cache offline page
				if (IS_DEV) {
					console.log('[Service Worker] Dev mode: Minimal caching');
					await cache.addAll([OFFLINE_URL]);
					return;
				}

				// Production caching
				console.log('[Service Worker] Caching assets for version:', version);

				// Fetch and store hash
				try {
					const hashResponse = await fetch(HASH_FILE);
					if (hashResponse.ok) {
						const hashData = await hashResponse.json();
						await cache.put('app-hash', new Response(hashData.hash));
					}
				} catch (error) {
					console.warn('[Service Worker] Hash fetch failed:', error);
				}

				// Cache static assets and offline page
				const assetsToCache = [...ASSETS, OFFLINE_URL];
				const cachePromises = assetsToCache.map(async (asset) => {
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

				await Promise.all(cachePromises);
				console.log('[Service Worker] Installation complete');
			} catch (error) {
				console.error('[Service Worker] Installation failed:', error);
			}
		})()
	);
});

// Activation
self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		(async () => {
			try {
				// In dev mode, skip most activation logic
				if (IS_DEV) {
					await self.clients.claim();
					return;
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

				// Check hash for potential updates
				try {
					const hashResponse = await fetch(HASH_FILE);
					if (hashResponse.ok) {
						const hashData = await hashResponse.json();
						const cache = await caches.open(CACHE_NAME);
						const storedHashResponse = await cache.match('app-hash');
						const storedHash = storedHashResponse ? await storedHashResponse.text() : null;

						if (storedHash !== hashData.hash) {
							console.log('[Service Worker] Hash changed, notifying clients');
							const clients = await self.clients.matchAll();
							clients.forEach((client) => {
								client.postMessage({
									type: 'NEW_VERSION_AVAILABLE',
									hash: hashData.hash
								});
							});
						}
					}
				} catch (error) {
					console.warn('[Service Worker] Hash check failed:', error);
				}

				await self.clients.claim();
				console.log('[Service Worker] Activation complete');
			} catch (error) {
				console.error('[Service Worker] Activation failed:', error);
			}
		})()
	);
});

// Fetch handling
self.addEventListener('fetch', (event: FetchEvent) => {
	const request = event.request;

	// Skip non-GET requests
	if (request.method !== 'GET') return;

	// Page request handling
	if (isPageRequest(request)) {
		event.respondWith(
			(async () => {
				try {
					// In dev mode, always go to network
					if (IS_DEV) {
						return await fetch(request);
					}

					// Network-first strategy
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

				return (await caches.match(OFFLINE_URL)) || new Response('Offline', { status: 503 });
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

// Utility functions
function isPageRequest(request: Request): boolean {
	const url = new URL(request.url);
	return (
		request.mode === 'navigate' ||
		(request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html'))
	);
}

function isApiRequest(request: Request): boolean {
	return request.url.includes('/api/');
}
