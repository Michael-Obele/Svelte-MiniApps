/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const IS_DEV = import.meta.env.DEV;
const CACHE_NAME = `app-cache-v${version}`; // Include version in cache name
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

		try {
			const hashResponse = await fetch(HASH_FILE);
			if (hashResponse.ok) {
				const hashData = await hashResponse.json();
				const cache = await caches.open(CACHE_NAME);
				const storedHashResponse = await cache.match('app-hash');
				const storedHash = storedHashResponse ? await storedHashResponse.text() : null;
				const clientStoredHash = localStorage.getItem('serviceWorkerHash');

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

				if (IS_DEV) {
					console.log('[Service Worker] Dev mode: Minimal caching');
					await cache.addAll([OFFLINE_URL]);
					return;
				}

				console.log('[Service Worker] Caching assets for version:', version);

				try {
					const hashResponse = await fetch(HASH_FILE);
					if (hashResponse.ok) {
						const hashData = await hashResponse.json();
						await cache.put('app-hash', new Response(hashData.hash));
					}
				} catch (error) {
					console.warn('[Service Worker] Hash fetch failed:', error);
				}

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
							headers.set('Cache-Control', `max-age=${MAX_AGE}`); // Fixed syntax

							const modifiedResponse = new Response(await cacheResponse.blob(), {
								status: cacheResponse.status,
								statusText: cacheResponse.statusText,
								headers
							});

							await cache.put(asset, modifiedResponse);
						}
					} catch (error) {
						console.warn(`Failed to cache asset: ${asset}`, error); // Fixed syntax
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
				if (IS_DEV) {
					await self.clients.claim();
					return;
				}

				const keys = await caches.keys();
				await Promise.all(
					keys.map((key) => {
						if (key !== CACHE_NAME && key.startsWith('app-cache-')) {
							return caches.delete(key);
						}
					})
				);

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

	if (request.method !== 'GET') return;

	if (isPageRequest(request)) {
		event.respondWith(
			(async () => {
				try {
					if (IS_DEV) {
						return await fetch(request);
					}

					const networkResponse = await fetch(request);
					if (networkResponse.ok) {
						const cache = await caches.open(CACHE_NAME);
						await cache.put(request, networkResponse.clone());
						return networkResponse;
					}
				} catch (error) {
					console.log('[Service Worker] Network request failed, falling back to cache');
				}

				const cachedResponse = await caches.match(request);
				if (cachedResponse && cachedResponse.ok) {
					return cachedResponse;
				}

				return (await caches.match(OFFLINE_URL)) || new Response('Offline', { status: 503 });
			})()
		);
		return;
	}

	if (isApiRequest(request)) {
		event.respondWith(
			(async () => {
				try {
					return await fetchWithRetry(request); // Use fetchWithRetry for API requests
				} catch (error) {
					console.error('[Service Worker] Network request failed:', error);
					return new Response('Network error', { status: 503, statusText: 'Network error' });
				}
			})()
		);
		return;
	}

	if (isStaticAsset(request)) {
		event.respondWith(
			caches.match(request).then((cachedResponse) => {
				return (
					cachedResponse ||
					fetchWithRetry(request).then((networkResponse) => {
						// Use fetchWithRetry for static assets
						return caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, networkResponse.clone());
							return networkResponse;
						});
					})
				);
			})
		);
		return;
	}

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

function isStaticAsset(request: Request): boolean {
	return /\.(png|jpg|jpeg|svg|gif|webp|js|css)$/i.test(request.url);
}

// Utility function for retrying network requests with exponential backoff
async function fetchWithRetry(request: Request, retries = 3): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(request);
			return response;
		} catch (error) {
			if (i === retries - 1) {
				// If it's the last retry, return a fallback Response
				return new Response('Network error', { status: 503, statusText: 'Network error' });
			}
			await new Promise((res) => setTimeout(res, Math.pow(2, i) * 1000)); // Exponential backoff
		}
	}
	// This line should never be reached, but TypeScript needs it
	throw new Error('Unreachable code');
}
