<script lang="ts">
	import { Bomb } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import * as DropdownMenu from '@/ui/dropdown-menu/index.js';
	import { buttonVariants } from '@/ui/button/index.js';

	let props = $props();

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
		window.location.reload();
	}

	function clearCookies() {
		toast.loading('Clearing cookies...', { duration: Number.POSITIVE_INFINITY });
		document.cookie.split(';').forEach((c) => {
			document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
		});
		toast.dismiss();
		toast.success('Cookies cleared!');
		window.location.reload();
	}

	function clearLocalStorage() {
		toast.loading('Clearing local storage...', { duration: Number.POSITIVE_INFINITY });
		localStorage.clear();
		toast.dismiss();
		toast.success('Local storage cleared!');
		window.location.reload();
	}

	function clearAll() {
		clearCache();
		clearCookies();
		clearLocalStorage();
		toast.success('All data cleared!');
		window.location.reload();
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
		class={[
			buttonVariants({
				variant: 'outline',
				size: 'icon'
			}),
			'hover:text-destructive-foreground)  outline outline-1 hover:bg-destructive',
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
			<DropdownMenu.Item onclick={() => handleSelection('localStorage')}
				>Clear Local Storage</DropdownMenu.Item
			>
			<DropdownMenu.Item onclick={() => handleSelection('all')}>Clear All</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
