import { notifyUpdateAvailable } from './serviceWorkerStore';

let isRegistered = false;

export async function registerServiceWorker() {
	if (isRegistered) return; // Prevent multiple registrations
	isRegistered = true;

	if (typeof window === 'undefined') {
		console.log('[ServiceWorker] Skipping registration - not in browser');
		return;
	}

	if (!('serviceWorker' in navigator)) {
		console.log('[ServiceWorker] Skipping registration - service workers not supported');
		return;
	}

	if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
		console.log('[ServiceWorker] Skipping registration - not on HTTPS or localhost');
		return;
	}

	try {
		const registration = await navigator.serviceWorker.register('/service-worker.js', {
			type: 'module',
			updateViaCache: 'none'
		});

		console.log('[ServiceWorker] Registration successful:', registration);

		console.log('[ServiceWorker] Registration successful:', {
			scope: registration.scope,
			active: !!registration.active,
			installing: !!registration.installing,
			waiting: !!registration.waiting
		});

		// Check for updates every 24 hours
		const CHECK_INTERVAL = 24 * 60 * 60 * 1000;
		let lastCheck = Date.now();

		async function checkForUpdates() {
			try {
				const hashResponse = await fetch('/service-worker-hash.json');
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

		// Periodic update check
		setInterval(() => {
			if (Date.now() - lastCheck >= CHECK_INTERVAL) {
				lastCheck = Date.now();
				checkForUpdates();
			}
		}, CHECK_INTERVAL);

		// Handle updates
		registration.addEventListener('updatefound', () => {
			const newWorker = registration.installing;
			if (!newWorker) return;

			newWorker.addEventListener('statechange', async () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					try {
						const hashResponse = await fetch('/service-worker-hash.json');
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

		// Handle SKIP_WAITING message
		navigator.serviceWorker.addEventListener('message', (event) => {
			if (event.data?.type === 'SKIP_WAITING' && registration.waiting) {
				registration.waiting.postMessage({ type: 'SKIP_WAITING' });
			}
		});
	} catch (error) {
		console.error('[ServiceWorker] Registration failed:', error);
	}
}
