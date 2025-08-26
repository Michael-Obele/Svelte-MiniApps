import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { RefreshCw } from '@lucide/svelte';

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
		icon: RefreshCw,
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

/**
 * Checks if a service worker update is available
 * @returns Readable store indicating whether an update is available
 */
export function isUpdateAvailable(): Readable<boolean> {
	return { subscribe: updateAvailable.subscribe };
}

/**
 * Gets the current update hash
 * @returns Readable store with the current update hash or null if no update is available
 */
export function getUpdateHash(): Readable<string | null> {
	return { subscribe: updateHash.subscribe };
}

/**
 * Checks if a service worker update is ready to be applied
 * @returns Readable store indicating whether an update is ready
 */
export function isUpdateReady(): Readable<boolean> {
	return { subscribe: updateReady.subscribe };
}

// Export a derived store for components that need to react to update state
export const serviceWorkerStore = derived(
	[updateAvailable, updateHash, updateReady],
	([$updateAvailable, $updateHash, $updateReady]) => {
		return {
			updateAvailable: $updateAvailable,
			updateHash: $updateHash,
			updateReady: $updateReady,
			applyUpdate
		};
	}
);

// Add the isReloading property to the Window interface
declare global {
	interface Window {
		isReloading?: boolean;
	}
}
