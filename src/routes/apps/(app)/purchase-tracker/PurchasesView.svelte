<script lang="ts">
	import { History } from '@lucide/svelte';
	import * as purchaseState from './states.svelte';
	import PurchaseRecord from './PurchaseRecord.svelte';

	interface Props {
		onEditPurchase: (purchase: any) => void;
	}

	let { onEditPurchase }: Props = $props();

	// Get all purchases with item information
	let purchasesWithItems = $derived(purchaseState.getPurchasesWithItems());
</script>

{#if purchasesWithItems.length > 0}
	<div class="space-y-6">
		{#each purchasesWithItems as purchase (purchase.id)}
			<PurchaseRecord {purchase} onEdit={onEditPurchase} />
		{/each}
	</div>
{:else}
	<div class="py-12 text-center">
		<History class="mx-auto mb-4 h-12 w-12 text-gray-400" />
		<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No purchase records</h3>
		<p class="text-gray-600 dark:text-gray-400">
			Add some purchases to your items to see the history here.
		</p>
	</div>
{/if}
