import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { RefreshCw } from 'lucide-svelte';

let swRegistration: ServiceWorkerRegistration | null = null;

export function notifyUpdateAvailable(registration: ServiceWorkerRegistration, newHash: string) {
	swRegistration = registration;

	// Retrieve the stored hash from local storage
	const storedHash = localStorage.getItem('serviceWorkerHash');

	// Ensure hash has actually changed and is not null/empty
	if (!newHash || newHash === storedHash) {
		console.log('[ServiceWorker] Hash unchanged, skipping update');
		return;
	}

	// Store the new hash and apply the update immediately
	localStorage.setItem('serviceWorkerHash', newHash);
	applyUpdate();
}

export async function applyUpdate() {
	if (swRegistration && swRegistration.waiting) {
		swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
		setTimeout(() => {
			window.location.reload();
		}, 500);
	}
}
