<script lang="ts">
	import { syncState, startSync } from '$lib/sync/sync-engine.svelte';
	import { Cloud, CloudOff, RefreshCw, TriangleAlert } from '@lucide/svelte';

	// startSync returns a cleanup function, which is exactly what $effect wants.
	$effect(() => startSync());

	let label = $derived(
		syncState.status === 'offline'
			? `Offline — ${syncState.pendingCount} saved locally`
			: syncState.status === 'syncing'
				? 'Syncing…'
				: syncState.status === 'error'
					? `${syncState.pendingCount} pending — will retry`
					: 'All changes synced'
	);
</script>

<div class="text-muted-foreground flex items-center gap-2 text-sm" aria-live="polite">
	{#if syncState.status === 'offline'}
		<CloudOff class="size-4" />
	{:else if syncState.status === 'syncing'}
		<RefreshCw class="size-4 animate-spin" />
	{:else if syncState.status === 'error'}
		<TriangleAlert class="size-4" />
	{:else}
		<Cloud class="size-4" />
	{/if}
	<span>{label}</span>
</div>
