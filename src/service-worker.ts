/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

import { build, files, version } from '$service-worker';

// Type-safe service worker global scope
const sw = self as unknown as ServiceWorkerGlobalScope;

// Determine if we're in development mode based on version
// In development, SvelteKit sets version to a timestamp that changes frequently
const IS_DEV = version.includes('.') === false && !isNaN(Number(version));
const CACHE_NAME = `app-cache-v${version}`; // Include version in cache name
const ASSETS = [...build, ...files];
const OFFLINE_URL = '/offline';
const HASH_FILE = '/service-worker-hash.json';

// Cache duration
const MAX_AGE = IS_DEV
	? 5 * 60 * 1000 // 5 minutes in dev
	: 24 * 60 * 60 * 1000; // 1 day in production

// Cache strategies
const STRATEGIES = {
	CACHE_FIRST: 'cache-first',
	NETWORK_FIRST: 'network-first',
	STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Define caching strategies for different types of requests
const ROUTE_STRATEGIES = [
	{ pattern: /\/(api|auth)\//, strategy: STRATEGIES.NETWORK_FIRST },
	{ pattern: /\.(js|css|woff2|woff|ttf|svg|png|jpg|jpeg|webp|avif)$/, strategy: STRATEGIES.CACHE_FIRST },
	{ pattern: /\/manifest\.json$/, strategy: STRATEGIES.STALE_WHILE_REVALIDATE },
	{ pattern: /\/favicon\//, strategy: STRATEGIES.CACHE_FIRST }
];

// Handle messages
sw.addEventListener('message', async (event) => {
	if (event.data?.type === 'DEBUG') {
		console.log('[Service Worker Debug]', event.data);
	}

	if (event.data?.type === 'SKIP_WAITING') {
		if (IS_DEV) {
			sw.skipWaiting();
			return;
		}

		try {
			const hashResponse = await fetch(HASH_FILE);
			if (hashResponse.ok) {
				const hashData = await hashResponse.json();
				const cache = await caches.open(CACHE_NAME);
				const storedHashResponse = await cache.match('app-hash');
				const storedHash = storedHashResponse ? await storedHashResponse.text() : null;

				if (storedHash !== hashData.hash) {
					console.log('[Service Worker] Hash changed, notifying clients');
					const clients = await sw.clients.matchAll();
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
sw.addEventListener('install', (event: ExtendableEvent) => {
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

				// Cache core assets first
				const assetsToCache = [...ASSETS, OFFLINE_URL];
				await Promise.all(
					assetsToCache.map(async (asset) => {
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
					})
				);
				
				console.log('[Service Worker] Installation complete');
			} catch (error) {
				console.error('[Service Worker] Installation failed:', error);
			}
		})()
	);
});

// Activation
sw.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		(async () => {
			try {
				if (IS_DEV) {
					await sw.clients.claim();
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

				// Check for hash changes and notify clients
				try {
					const hashResponse = await fetch(HASH_FILE);
					if (hashResponse.ok) {
						const hashData = await hashResponse.json();
						const cache = await caches.open(CACHE_NAME);
						const storedHashResponse = await cache.match('app-hash');
						const storedHash = storedHashResponse ? await storedHashResponse.text() : null;

						if (storedHash !== hashData.hash) {
							console.log('[Service Worker] Hash changed, notifying clients');
							const clients = await sw.clients.matchAll();
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

				await sw.clients.claim();
				console.log('[Service Worker] Activation complete');
			} catch (error) {
				console.error('[Service Worker] Activation failed:', error);
			}
		})()
	);
});

// Fetch handling
sw.addEventListener('fetch', (event: FetchEvent) => {
	const request = event.request;

	if (request.method !== 'GET') return;

	// Handle page requests (navigation)
	if (isHtmlPageRequest(request)) {
		event.respondWith(
			(async () => {
				try {
					if (IS_DEV) {
						return await fetch(request);
					}

					// Try network first for page requests
					const networkResponse = await fetch(request);
					if (networkResponse.ok) {
						const cache = await caches.open(CACHE_NAME);
						await cache.put(request, networkResponse.clone());
						return networkResponse;
					}
				} catch (error) {
					console.log('[Service Worker] Network request failed, falling back to cache');
				}

				// Try to get from cache
				const cachedResponse = await caches.match(request);
				if (cachedResponse && cachedResponse.ok) {
					return cachedResponse;
				}

				// If not in cache, serve the offline page
				return (await caches.match(OFFLINE_URL)) || new Response('Offline', { status: 503 });
			})()
		);
		return;
	}

	// Handle API requests
	if (isApiRequest(request)) {
		event.respondWith(
			(async () => {
				try {
					return await fetchWithRetry(request); // Use fetchWithRetry for API requests
				} catch (error) {
					console.error('[Service Worker] Network request failed:', error);
					return new Response(JSON.stringify({ error: 'Network error', offline: true }), { 
						status: 503, 
						statusText: 'Network error',
						headers: { 'Content-Type': 'application/json' }
					});
				}
			})()
		);
		return;
	}

	// Handle static assets
	if (isStaticAsset(request)) {
		event.respondWith(
			(async () => {
				// Check cache first for static assets
				const cachedResponse = await caches.match(request);
				if (cachedResponse && cachedResponse.ok) {
					// Revalidate in the background
					fetchAndCache(request, CACHE_NAME).catch(() => {});
					return cachedResponse;
				}

				// If not in cache, fetch from network and cache
				try {
					const networkResponse = await fetchWithRetry(request);
					if (networkResponse.ok) {
						const cache = await caches.open(CACHE_NAME);
						cache.put(request, networkResponse.clone());
					}
					return networkResponse;
				} catch (error) {
					console.error('[Service Worker] Failed to fetch static asset:', error);
					return new Response('Network error', { status: 503 });
				}
			})()
		);
		return;
	}

	// For all other requests, determine strategy based on URL patterns
	const strategy = getStrategyForUrl(request.url);
	
	event.respondWith(
		(async () => {
			switch (strategy) {
				case STRATEGIES.CACHE_FIRST:
					return await handleCacheFirst(request);
				case STRATEGIES.NETWORK_FIRST:
					return await handleNetworkFirst(request);
				case STRATEGIES.STALE_WHILE_REVALIDATE:
					return await handleStaleWhileRevalidate(request);
				default:
					return await handleNetworkFirst(request);
			}
		})()
	);
});

// Utility functions
function isHtmlPageRequest(request: Request): boolean {
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
	return /\.(png|jpg|jpeg|svg|gif|webp|avif|js|css|woff2|woff|ttf)$/i.test(request.url);
}

// Utility function for retrying network requests with exponential backoff
async function fetchWithRetry(request: Request, retries = 3): Promise<Response> {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(request);
			return response;
		} catch (error) {
			if (i === retries - 1) {
				throw error;
			}
			await new Promise((res) => setTimeout(res, Math.pow(2, i) * 1000)); // Exponential backoff
		}
	}
	// This line should never be reached, but TypeScript needs it
	throw new Error('Unreachable code');
}

// Fetch and cache a resource
async function fetchAndCache(request: Request, cacheName: string): Promise<Response> {
	const response = await fetch(request);
	if (response.ok) {
		const cache = await caches.open(cacheName);
		await cache.put(request, response.clone());
	}
	return response;
}

// Get the appropriate caching strategy for a URL
function getStrategyForUrl(url: string): string {
	for (const route of ROUTE_STRATEGIES) {
		if (route.pattern.test(url)) {
			return route.strategy;
		}
	}
	return STRATEGIES.NETWORK_FIRST; // Default strategy
}

// Cache-first strategy handler
async function handleCacheFirst(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request);
	
	if (cachedResponse && cachedResponse.ok) {
		// Revalidate in the background
		fetchAndCache(request, CACHE_NAME).catch(() => {});
		return cachedResponse;
	}
	
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			await cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		console.error('[Service Worker] Network request failed:', error);
		return new Response('Network error', { status: 503 });
	}
}

// Network-first strategy handler
async function handleNetworkFirst(request: Request): Promise<Response> {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			await cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		const cache = await caches.open(CACHE_NAME);
		const cachedResponse = await cache.match(request);
		
		if (cachedResponse && cachedResponse.ok) {
			return cachedResponse;
		}
		
		console.error('[Service Worker] Network request failed and no cache available:', error);
		return new Response('Network error', { status: 503 });
	}
}

// Stale-while-revalidate strategy handler
async function handleStaleWhileRevalidate(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request);
	
	const networkResponsePromise = fetch(request).then(response => {
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	}).catch(error => {
		console.error('[Service Worker] Network request failed:', error);
		return null;
	});
	
	// Return the cached response immediately if available
	if (cachedResponse && cachedResponse.ok) {
		networkResponsePromise.catch(() => {}); // Handle in background
		return cachedResponse;
	}
	
	// Otherwise wait for the network response
	const networkResponse = await networkResponsePromise;
	if (networkResponse) {
		return networkResponse;
	}
	
	return new Response('Network error', { status: 503 });
}
