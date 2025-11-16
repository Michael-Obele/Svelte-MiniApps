<script lang="ts">
	import { getCurrentUser, backupPurchaseData, syncPurchaseData } from '$lib/remote';
	import { items, purchases } from './states.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Download, RefreshCw } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { children } = $props();

	let currentUser = $state<{
		id: string;
		username: string;
		role: string;
	} | null>(null);

	// Load current user on mount
	$effect(() => {
		getCurrentUser().then((user) => {
			currentUser = user || null;
		});
	});

	async function handleBackup() {
		if (!currentUser) {
			toast.error('Please sign in to backup data');
			return;
		}

		try {
			const result = await backupPurchaseData({
				items: items.current,
				purchases: purchases.current
			});
			if (result?.success) {
				toast.success(
					`Backup created: ${result.itemsCount} items, ${result.purchasesCount} purchases`
				);
			} else {
				toast.error('Backup failed');
			}
		} catch (error) {
			toast.error('Failed to create backup');
		}
	}

	async function handleSync() {
		if (!currentUser) {
			toast.error('Please sign in to sync data');
			return;
		}

		try {
			const result = await syncPurchaseData({
				items: items.current,
				purchases: purchases.current
			});
			if (result?.success && result.items && result.purchases) {
				items.current = result.items;
				purchases.current = result.purchases;
				toast.success('Data synced successfully');
			} else {
				toast.error('Sync failed');
			}
		} catch (error) {
			toast.error('Failed to sync data');
		}
	}
</script>

<div class="container mx-auto py-6">
	<header class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">Purchase Tracker</h1>
				<p class="text-muted-foreground mt-1">Track your purchases and analyze spending patterns</p>
			</div>

			<div class="flex gap-2">
				{#if currentUser}
					<Button variant="outline" size="sm" onclick={handleSync}>
						<RefreshCw class="mr-2 size-4" />
						Sync
					</Button>
					<Button variant="outline" size="sm" onclick={handleBackup}>
						<Download class="mr-2 size-4" />
						Backup
					</Button>
				{:else}
					<p class="text-muted-foreground text-sm">Sign in to sync and backup your data</p>
				{/if}
			</div>
		</div>
	</header>

	{@render children()}
</div>
