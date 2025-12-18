<script lang="ts">
	import { EllipsisVertical, Edit, ShoppingCart, History, Trash2 } from '@lucide/svelte';
	import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { Button } from '@/ui/button';
	import * as DropdownMenu from '@/ui/dropdown-menu';

	import type { Item } from '../states.svelte';
	import * as purchaseState from '../states.svelte';

	interface Props {
		item: Item;
		onEdit: (item: Item) => void;
		onAddPurchase: (item: Item) => void;
		onViewHistory: (item: Item) => void;
		onDelete: (item: Item) => void;
	}

	let { item, onEdit, onAddPurchase, onViewHistory, onDelete }: Props = $props();

	// Get item statistics
	let stats = $derived(purchaseState.getItemStats(item.id));

	// Format currency helper
	function formatCurrency(amount: number, currency: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD'
		}).format(amount);
	}
</script>

<Card class="transition-shadow hover:shadow-lg">
	<CardHeader class="pb-3">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<CardTitle class="text-lg">{item.name}</CardTitle>
				<div class="mt-1 flex items-center gap-2">
					<Badge variant="secondary" class="text-xs">
						{purchaseState.getAllCategories().find((c) => c.id === item.category)?.icon}
						{purchaseState.getAllCategories().find((c) => c.id === item.category)?.name}
					</Badge>
				</div>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" size="sm">
						<EllipsisVertical class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={() => onEdit(item)}>
						<Edit class="mr-2 h-4 w-4" />
						Edit Item
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onAddPurchase(item)}>
						<ShoppingCart class="mr-2 h-4 w-4" />
						Add Purchase
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onViewHistory(item)}>
						<History class="mr-2 h-4 w-4" />
						View History
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => onDelete(item)} class="text-red-600">
						<Trash2 class="mr-2 h-4 w-4" />
						Delete Item
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</CardHeader>
	<CardContent>
		{#if item.description}
			<p class="mb-3 text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
		{/if}

		<div class="space-y-2 text-sm">
			{#if item.defaultUnit}
				<div class="flex justify-between">
					<span class="text-gray-500">Unit:</span>
					<span>{item.defaultUnit}</span>
				</div>
			{/if}
			<div class="flex justify-between">
				<span class="text-gray-500">Currency:</span>
				<span>{item.defaultCurrency}</span>
			</div>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-gray-500">Total Purchases:</span>
					<span class="font-medium">{stats.totalPurchases}</span>
				</div>
				{#if stats.totalSpent > 0}
					<div class="flex justify-between">
						<span class="text-gray-500">Total Spent:</span>
						<span class="font-medium"
							>{formatCurrency(stats.totalSpent, item.defaultCurrency || 'USD')}</span
						>
					</div>
				{/if}
			</div>
		</div>
	</CardContent>
</Card>
