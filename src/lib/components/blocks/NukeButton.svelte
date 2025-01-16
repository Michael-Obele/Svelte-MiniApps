<script lang="ts">
	import { Bomb } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	let { class: className = '' } = $props();

	async function clearCache() {
		toast.loading('Clearing cache...', { duration: Number.POSITIVE_INFINITY });
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
		toast.dismiss();
		toast.success('Cache cleared!');
	}

	function clearCookies() {
		toast.loading('Clearing cookies...', { duration: Number.POSITIVE_INFINITY });
		document.cookie.split(';').forEach((c) => {
			document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
		});
		toast.dismiss();
		toast.success('Cookies cleared!');
	}

	function clearLocalStorage() {
		toast.loading('Clearing local storage...', { duration: Number.POSITIVE_INFINITY });
		localStorage.clear();
		toast.dismiss();
		toast.success('Local storage cleared!');
	}

	function clearAll() {
		clearCache();
		clearCookies();
		clearLocalStorage();
		toast.success('All data cleared!');
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
			case 'all':
				clearAll();
				break;
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class="{buttonVariants({
			variant: 'outline'
		})} hover:text-destructive-foreground) outline outline-1 hover:bg-destructive {className}"
	>
		<span class="sr-only">Reset App & Nuke Data</span>
		<Bomb class="h-4 w-4" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Clear Data</DropdownMenu.GroupHeading>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => handleSelection('cache')}>Clear Cache</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => handleSelection('cookies')}>Clear Cookies</DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => handleSelection('localStorage')}
				>Clear Local Storage</DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => handleSelection('all')}>Clear All</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
