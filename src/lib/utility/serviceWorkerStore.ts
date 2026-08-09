import { writable, type Writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { type Icon, RefreshCw } from '@lucide/svelte';

// Create reactive state using Svelte stores
const updateAvailable: Writable<boolean> = writable(false);
const updateHash: Writable<string | null> = writable(null);
const updateReady: Writable<boolean> = writable(false);
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Notifies the user that a service worker update is available
 * @param registration The service worker registration
 * @param newHash The new hash value for the service worker
 */
export function notifyUpdateAvailable(registration: ServiceWorkerRegistration, newHash: string) {
	swRegistration = registration;

	// Retrieve the stored hash from local storage
	const storedHash = localStorage.getItem('serviceWorkerHash');

	// Ensure hash has actually changed and is not null/empty
	if (!newHash || newHash === storedHash) {
		console.log('[ServiceWorker] Hash unchanged, skipping update');
		return;
	}

	// Update reactive state
	updateAvailable.set(true);
	updateHash.set(newHash);
	updateReady.set(!!registration.waiting);

	// Store the new hash
	localStorage.setItem('serviceWorkerHash', newHash);

	// Show a toast notification to the user with a custom component
	toast('A new version of the app is available', {
		description: 'Refresh to update to the latest version',
		action: {
			label: 'Update Now',
			onClick: () => applyUpdate()
		},
		duration: 0,
		id: 'sw-update',
		position: 'top-right'
	});
}

/**
 * Applies the service worker update and reloads the page
 */
export async function applyUpdate() {
	if (swRegistration && swRegistration.waiting) {
		// Update state
		updateReady.set(false);

		// Send message to the waiting service worker
		swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

		// Set a flag to prevent multiple reloads
		window.isReloading = true;

		// Reload after a short delay to allow the service worker to activate
		setTimeout(() => {
			window.location.reload();
		}, 500);
	}
}

// Add the isReloading property to the Window interface
declare global {
	interface Window {
		isReloading?: boolean;
	}
}
