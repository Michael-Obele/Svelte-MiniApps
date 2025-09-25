<script lang="ts">
	import { Bomb } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import * as DropdownMenu from '@/ui/dropdown-menu/index.js';
	import { buttonVariants } from '@/ui/button/index.js';

	let props = $props();

	// Enhanced cache clearing including service worker caches and Clear-Site-Data header
	async function clearCache() {
		const toastId = toast.loading('Clearing cache...', { duration: Number.POSITIVE_INFINITY });

		try {
			// Use Clear-Site-Data header for comprehensive clearing
			await fetch('/api/clear-site-data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clearType: 'cache' })
			});

			// Also manually clear Cache Storage API caches as fallback
			const cacheKeys = await caches.keys();
			await Promise.all(
				cacheKeys.map(async (key) => {
					try {
						await caches.delete(key);
						console.log(`Deleted cache: ${key}`);
					} catch (error) {
						console.error(`Failed to delete cache ${key}:`, error);
					}
				})
			);

			// Attempt to clear service worker cache
			if ('serviceWorker' in navigator) {
				const registrations = await navigator.serviceWorker.getRegistrations();
				for (const registration of registrations) {
					try {
						await registration.update();
						console.log('Service worker updated');
					} catch (error) {
						console.error('Failed to update service worker:', error);
					}
				}
			}
		} catch (error) {
			console.error('Error clearing cache:', error);
			toast.error('Failed to clear cache completely');
			return;
		}

		toast.dismiss(toastId);
		toast.success('Cache cleared successfully!');
		setTimeout(() => window.location.reload(), 1000);
	}

	// Enhanced cookie clearing with Clear-Site-Data header and better domain handling
	async function clearCookies() {
		const toastId = toast.loading('Clearing cookies...', { duration: Number.POSITIVE_INFINITY });

		try {
			// Use Clear-Site-Data header for comprehensive clearing
			await fetch('/api/clear-site-data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clearType: 'cookies' })
			});

			// Also manually clear cookies as fallback
			const cookies = document.cookie.split(';');

			cookies.forEach((cookie) => {
				const eqPos = cookie.indexOf('=');
				const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

				if (name) {
					// Clear for current domain and path
					document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
					// Clear for current domain and root
					document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`;
					// Clear for parent domain
					const domain = window.location.hostname;
					const parts = domain.split('.');
					if (parts.length > 2) {
						const parentDomain = '.' + parts.slice(-2).join('.');
						document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${parentDomain};`;
					}
				}
			});
		} catch (error) {
			console.error('Error clearing cookies:', error);
			toast.error('Failed to clear cookies completely');
			return;
		}

		toast.dismiss(toastId);
		toast.success('Cookies cleared successfully!');
		setTimeout(() => window.location.reload(), 1000);
	}

	// Clear localStorage with Clear-Site-Data header
	async function clearLocalStorage() {
		const toastId = toast.loading('Clearing local storage...', {
			duration: Number.POSITIVE_INFINITY
		});

		try {
			// Use Clear-Site-Data header for storage (includes localStorage, sessionStorage, IndexedDB)
			await fetch('/api/clear-site-data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clearType: 'storage' })
			});

			// Also manually clear as fallback
			localStorage.clear();
		} catch (error) {
			console.error('Error clearing localStorage:', error);
			toast.error('Failed to clear local storage');
			return;
		}

		toast.dismiss(toastId);
		toast.success('Local storage cleared successfully!');
		setTimeout(() => window.location.reload(), 1000);
	}

	// Clear sessionStorage
	function clearSessionStorage() {
		const toastId = toast.loading('Clearing session storage...', {
			duration: Number.POSITIVE_INFINITY
		});

		try {
			sessionStorage.clear();
		} catch (error) {
			console.error('Error clearing sessionStorage:', error);
			toast.error('Failed to clear session storage');
			return;
		}

		toast.dismiss(toastId);
		toast.success('Session storage cleared successfully!');
		setTimeout(() => window.location.reload(), 1000);
	}

	// Clear IndexedDB databases
	async function clearIndexedDB() {
		const toastId = toast.loading('Clearing IndexedDB...', { duration: Number.POSITIVE_INFINITY });

		try {
			if ('indexedDB' in window) {
				// Get list of databases (if supported)
				if ('databases' in indexedDB) {
					const databases = await indexedDB.databases();
					await Promise.all(
						databases.map(async (db) => {
							if (db.name) {
								try {
									const deleteRequest = indexedDB.deleteDatabase(db.name);
									await new Promise((resolve, reject) => {
										deleteRequest.onsuccess = () => resolve(undefined);
										deleteRequest.onerror = () => reject(deleteRequest.error);
										deleteRequest.onblocked = () => {
											console.warn(`IndexedDB deletion blocked for: ${db.name}`);
											resolve(undefined);
										};
									});
									console.log(`Deleted IndexedDB: ${db.name}`);
								} catch (error) {
									console.error(`Failed to delete IndexedDB ${db.name}:`, error);
								}
							}
						})
					);
				} else {
					console.warn('indexedDB.databases() not supported - cannot enumerate databases');
				}
			}
		} catch (error) {
			console.error('Error clearing IndexedDB:', error);
			toast.error('Failed to clear IndexedDB completely');
			return;
		}

		toast.dismiss(toastId);
		toast.success('IndexedDB cleared successfully!');
		setTimeout(() => window.location.reload(), 1000);
	}

	// Clear all storage types with comprehensive Clear-Site-Data approach
	async function clearAll() {
		const toastId = toast.loading('Clearing all data...', { duration: Number.POSITIVE_INFINITY });

		try {
			// Use Clear-Site-Data header for comprehensive clearing
			await fetch('/api/clear-site-data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clearType: 'all' })
			});

			// Also run manual clearing operations as fallback
			await Promise.allSettled([
				// Manual cache clearing
				(async () => {
					const cacheKeys = await caches.keys();
					await Promise.all(cacheKeys.map((key) => caches.delete(key)));
				})(),
				// Manual storage clearing
				Promise.resolve(localStorage.clear()),
				Promise.resolve(sessionStorage.clear()),
				// Manual IndexedDB clearing
				(async () => {
					if ('indexedDB' in window && 'databases' in indexedDB) {
						const databases = await indexedDB.databases();
						await Promise.all(
							databases.map(async (db) => {
								if (db.name) {
									const deleteRequest = indexedDB.deleteDatabase(db.name);
									await new Promise((resolve) => {
										deleteRequest.onsuccess = () => resolve(undefined);
										deleteRequest.onerror = () => resolve(undefined);
										deleteRequest.onblocked = () => resolve(undefined);
									});
								}
							})
						);
					}
				})()
			]);
		} catch (error) {
			console.error('Error during comprehensive clear:', error);
			toast.error('Some data may not have been cleared');
			return;
		}

		toast.dismiss(toastId);
		toast.success('All data cleared successfully!');
		setTimeout(() => window.location.reload(), 1500);
	}

	function handleSelection(option: string) {
		switch (option) {
			case 'cache':
				clearCache();
				break;
			case 'cookies':
				clearCookies();
				break;
			case 'localStorage':
				clearLocalStorage();
				break;
			case 'sessionStorage':
				clearSessionStorage();
				break;
			case 'indexedDB':
				clearIndexedDB();
				break;
			case 'all':
				clearAll();
				break;
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={[
			buttonVariants({
				variant: 'outline',
				size: 'icon'
			}),
			'hover:bg-destructive hover:text-destructive-foreground outline-0 hover:outline-1',
			props.class
		]}
	>
		<span class="sr-only">Reset App & Nuke Data</span>
		<Bomb class="size-4" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Clear Data</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => handleSelection('cache')}>Clear Cache</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => handleSelection('cookies')}>Clear Cookies</DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => handleSelection('localStorage')}>
				Clear Local Storage
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => handleSelection('sessionStorage')}>
				Clear Session Storage
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => handleSelection('indexedDB')}>
				Clear IndexedDB
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onclick={() => handleSelection('all')}
				class="text-destructive focus:text-destructive"
			>
				Clear All Data
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
