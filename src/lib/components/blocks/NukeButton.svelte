<script lang="ts">
	import { Bomb } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '../ui/button';
	import { cn } from '$lib/utils';

	let { class: className = '' } = $props();

	async function nukeData() {
		try {
			// Show confirmation dialog
			if (!confirm('⚠️ Warning: This will delete all cached data and reset the app. Continue?')) {
				return;
			}

			toast.loading('Nuking site data...', {
				duration: Number.POSITIVE_INFINITY
			});

			// Clear all caches
			const cacheKeys = await caches.keys();
			await Promise.all(
				cacheKeys.map(async (key) => {
					try {
						await caches.delete(key);
					} catch (error) {
						console.error(`Failed to delete cache ${key}:`, error);
					}
				})
			);

			// Clear localStorage
			localStorage.clear();

			// Clear sessionStorage
			sessionStorage.clear();

			// Unregister service workers
			if ('serviceWorker' in navigator) {
				const registrations = await navigator.serviceWorker.getRegistrations();
				await Promise.all(
					registrations.map(async (reg) => {
						try {
							await reg.unregister();
						} catch (error) {
							console.error('Failed to unregister service worker:', error);
						}
					})
				);
			}

			// Clear IndexedDB databases
			const databases = await window.indexedDB.databases();
			await Promise.all(
				databases.map(async (db) => {
					if (db.name) {
						try {
							await window.indexedDB.deleteDatabase(db.name);
						} catch (error) {
							console.error(`Failed to delete database ${db.name}:`, error);
						}
					}
				})
			);

			toast.dismiss();
			toast.success('Site data cleared! Reloading...');

			// Reload the page after a short delay
			setTimeout(() => {
				window.location.href = '/';
			}, 1500);
		} catch (error) {
			console.error('Error nuking data:', error);
			toast.error('Failed to clear some data. Try again or check console for details.');
		}
	}
</script>

<Button
	variant="outline"
	size="icon"
	class={cn('outline outline-1 hover:bg-destructive hover:text-destructive-foreground', className)}
	onclick={nukeData}
>
	<span class="sr-only">Reset App & Nuke Data</span>
	<Bomb class="h-4 w-4" />
</Button>
