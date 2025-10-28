<script lang="ts">
	import { Edit } from '@lucide/svelte';
	import { Card, CardContent } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { Button } from '@/ui/button';

	import type { PurchaseRecord } from './states.svelte';
	import * as purchaseState from './states.svelte';

	interface Props {
		purchase: PurchaseRecord & { item: any };
		onEdit: (purchase: PurchaseRecord) => void;
	}

	let { purchase, onEdit }: Props = $props();

	// Format currency helper
	function formatCurrency(amount: number, currency: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD'
		}).format(amount);
	}

	// Format date helper
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<Card>
	<CardContent class="pt-6">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<div class="mb-2 flex items-center gap-3">
					<h3 class="font-medium">{purchase.item.name}</h3>
					<Badge variant="secondary" class="text-xs">
						{purchaseState.getAllCategories().find((c) => c.id === purchase.item.category)?.icon}
						{purchaseState.getAllCategories().find((c) => c.id === purchase.item.category)?.name}
					</Badge>
				</div>
				<div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
					<div>
						<span class="text-gray-500">Quantity:</span>
						<div class="font-medium">
							{purchase.quantity}
							{purchase.item.defaultUnit || 'units'}
						</div>
					</div>
					<div>
						<span class="text-gray-500">Cost:</span>
						<div class="font-medium">
							{formatCurrency(purchase.cost, purchase.currency)}
						</div>
					</div>
					<div>
						<span class="text-gray-500">Date:</span>
						<div class="font-medium">{formatDate(purchase.date)}</div>
					</div>
					<div>
						<span class="text-gray-500">Location:</span>
						<div class="font-medium">{purchase.location || 'N/A'}</div>
					</div>
				</div>
				{#if purchase.notes}
					<div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
						<span class="text-gray-500">Notes:</span>
						{purchase.notes}
					</div>
				{/if}
			</div>
			<Button variant="ghost" size="sm" onclick={() => onEdit(purchase)}>
				<Edit class="h-4 w-4" />
			</Button>
		</div>
	</CardContent>
</Card>
