import { notifyUpdateAvailable } from './serviceWorkerStore';
import { browser } from '$app/environment';

let isRegistered = false;

/**
 * Registers the service worker and sets up update handling
 * @returns Promise that resolves when registration is complete
 */
export async function registerServiceWorker() {
	if (isRegistered) return; // Prevent multiple registrations
	isRegistered = true;

	if (!browser) {
		console.log('[ServiceWorker] Skipping registration - not in browser');
		return;
	}

	if (!('serviceWorker' in navigator)) {
		console.log('[ServiceWorker] Skipping registration - service workers not supported');
		return;
	}

	// Only register on HTTPS or localhost
	if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
		console.log('[ServiceWorker] Skipping registration - not on HTTPS or localhost');
		return;
	}

	try {
		// Register the service worker with the appropriate type
		const registration = await navigator.serviceWorker.register('/service-worker.js', {
			type: import.meta.env.DEV ? 'module' : 'classic',
			updateViaCache: 'none',
			scope: '/'
		});

		console.log('[ServiceWorker] Registration successful:', {
			scope: registration.scope,
			active: !!registration.active,
			installing: !!registration.installing,
			waiting: !!registration.waiting
		});

		// Set up update checking
		setupUpdateChecking(registration);
		
		// Handle updates
		setupUpdateHandling(registration);
		
		// Return the registration for potential further use
		return registration;
	} catch (error) {
		console.error('[ServiceWorker] Registration failed:', error);
		return null;
	}
}

/**
 * Sets up periodic update checking for the service worker
 * @param registration The service worker registration
 */
function setupUpdateChecking(registration: ServiceWorkerRegistration) {
	// Check for updates every hour in development, every day in production
	const CHECK_INTERVAL = import.meta.env.DEV 
		? 60 * 60 * 1000 // 1 hour
		: 24 * 60 * 60 * 1000; // 24 hours
	
	let lastCheck = Date.now();

	// Initial check on page load
	setTimeout(() => checkForUpdates(registration), 5000);

	// Periodic update check
	setInterval(() => {
		if (Date.now() - lastCheck >= CHECK_INTERVAL) {
			lastCheck = Date.now();
			checkForUpdates(registration);
		}
	}, Math.min(CHECK_INTERVAL, 60 * 60 * 1000)); // Check at most every hour
}

/**
 * Checks for service worker updates by comparing hash values
 * @param registration The service worker registration
 */
async function checkForUpdates(registration: ServiceWorkerRegistration) {
	try {
		// Add cache-busting query parameter to prevent caching
		const hashResponse = await fetch(`/service-worker-hash.json?_=${Date.now()}`);
		if (!hashResponse.ok) return;

		const hashData = await hashResponse.json();
		const newHash = hashData.hash;
		const storedHash = localStorage.getItem('serviceWorkerHash');
		
		// Only trigger update if hash has changed
		if (newHash && newHash !== storedHash) {
			console.log('[ServiceWorker] New hash detected:', newHash);
			await registration.update();
			notifyUpdateAvailable(registration, newHash);
		} else {
			console.log('[ServiceWorker] Hash unchanged, no update needed');
		}
	} catch (error) {
		console.error('[ServiceWorker] Update check failed:', error);
	}
}

/**
 * Sets up event listeners for handling service worker updates
 * @param registration The service worker registration
 */
function setupUpdateHandling(registration: ServiceWorkerRegistration) {
	// Handle updates
	registration.addEventListener('updatefound', () => {
		const newWorker = registration.installing;
		if (!newWorker) return;

		newWorker.addEventListener('statechange', async () => {
			if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
				try {
					const hashResponse = await fetch(`/service-worker-hash.json?_=${Date.now()}`);
					if (!hashResponse.ok) return;

					const hashData = await hashResponse.json();
					const newHash = hashData.hash;
					const storedHash = localStorage.getItem('serviceWorkerHash');

					// Ensure hash has actually changed before notifying
					if (newHash && newHash !== storedHash) {
						console.log('[ServiceWorker] New version ready with hash:', newHash);
						notifyUpdateAvailable(registration, newHash);
					} else {
						console.log('[ServiceWorker] Hash unchanged, skipping update');
					}
				} catch (error) {
					console.error('[ServiceWorker] Hash check failed:', error);
				}
			}
		});
	});

	// Handle messages from the service worker
	navigator.serviceWorker.addEventListener('message', (event) => {
		console.log('[ServiceWorker] Message received:', event.data);
		
		if (event.data?.type === 'NEW_VERSION_AVAILABLE' && event.data?.hash) {
			notifyUpdateAvailable(registration, event.data.hash);
		}
		
		if (event.data?.type === 'SKIP_WAITING' && registration.waiting) {
			registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		}
	});
	
	// Handle controller change (after skipWaiting)
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		console.log('[ServiceWorker] Controller changed, reloading page');
		// Only reload if we're not already reloading
		if (!window.isReloading) {
			window.isReloading = true;
			window.location.reload();
		}
	});
}

// Add the isReloading property to the Window interface
declare global {
	interface Window {
		isReloading?: boolean;
	}
}
