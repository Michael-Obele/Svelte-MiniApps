<script lang="ts">
	import { History, CalendarRange, List, Calendar } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Badge } from '@/ui/badge';
	import * as purchaseState from './states.svelte';
	import PurchaseRecord from './PurchaseRecord.svelte';

	interface Props {
		onEditPurchase: (purchase: any) => void;
	}

	let { onEditPurchase }: Props = $props();

	type GroupingMode = 'month' | 'year' | 'all';
	let groupingMode = $state<GroupingMode>('month');

	// Get all purchases with item information
	let purchasesWithItems = $derived(purchaseState.getPurchasesWithItems());

	function formatMonthYear(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
	}

	function formatYear(dateString: string) {
		const date = new Date(dateString);
		return date.getFullYear().toString();
	}

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD'
		}).format(amount);
	}

	// Group purchases by month, year, or show all
	let groupedPurchases = $derived.by(() => {
		if (groupingMode === 'all') return { 'All Purchases': purchasesWithItems };

		const grouped: Record<string, typeof purchasesWithItems> = {};
		purchasesWithItems.forEach((purchase) => {
			const groupKey = groupingMode === 'month' 
				? formatMonthYear(purchase.date)
				: formatYear(purchase.date);
			
			if (!grouped[groupKey]) {
				grouped[groupKey] = [];
			}
			grouped[groupKey].push(purchase);
		});

		// Sort groups by date (most recent first)
		const sortedGroups: Record<string, typeof purchasesWithItems> = {};
		Object.keys(grouped)
			.sort((a, b) => {
				const dateA = new Date(grouped[a][0].date);
				const dateB = new Date(grouped[b][0].date);
				return dateB.getTime() - dateA.getTime();
			})
			.forEach((key) => {
				sortedGroups[key] = grouped[key];
			});

		return sortedGroups;
	});

	// Calculate stats for each group
	function getGroupStats(groupPurchases: typeof purchasesWithItems) {
		const totalQuantity = groupPurchases.reduce((sum, p) => sum + p.quantity, 0);
		const totalSpent = groupPurchases.reduce((sum, p) => sum + p.cost, 0);
		return { totalQuantity, totalSpent, count: groupPurchases.length };
	}
</script>

{#if purchasesWithItems.length > 0}
	<div class="mb-6 flex items-center justify-between">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">All Purchase Records</h3>
		<div class="flex items-center gap-2">
			<Button
				variant={groupingMode === 'month' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (groupingMode = 'month')}
				class="h-9"
			>
				<CalendarRange class="mr-1.5 h-4 w-4" />
				By Month
			</Button>
			<Button
				variant={groupingMode === 'year' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (groupingMode = 'year')}
				class="h-9"
			>
				<Calendar class="mr-1.5 h-4 w-4" />
				By Year
			</Button>
			<Button
				variant={groupingMode === 'all' ? 'default' : 'outline'}
				size="sm"
				onclick={() => (groupingMode = 'all')}
				class="h-9"
			>
				<List class="mr-1.5 h-4 w-4" />
				All
			</Button>
			<Badge variant="secondary" class="ml-2">
				{purchasesWithItems.length} record{purchasesWithItems.length !== 1 ? 's' : ''}
			</Badge>
		</div>
	</div>

	<div class="space-y-6">
		{#each Object.entries(groupedPurchases) as [groupName, groupPurchases]}
			{#if groupingMode !== 'all'}
				{@const groupStats = getGroupStats(groupPurchases)}
				<div class="space-y-4">
					<div
						class="sticky top-0 z-10 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 backdrop-blur-sm dark:bg-gray-800"
					>
						<div class="flex items-center gap-2">
							{#if groupingMode === 'month'}
								<CalendarRange class="h-5 w-5 text-gray-600 dark:text-gray-400" />
							{:else}
								<Calendar class="h-5 w-5 text-gray-600 dark:text-gray-400" />
							{/if}
							<h4 class="text-lg font-semibold text-gray-900 dark:text-white">{groupName}</h4>
							<Badge variant="outline">
								{groupPurchases.length} purchase{groupPurchases.length !== 1 ? 's' : ''}
							</Badge>
						</div>
						<div class="text-sm font-medium text-gray-600 dark:text-gray-400">
							Total: {formatCurrency(groupStats.totalSpent, 'USD')}
						</div>
					</div>

					<div class="space-y-3">
						{#each groupPurchases as purchase (purchase.id)}
							<PurchaseRecord {purchase} onEdit={onEditPurchase} />
						{/each}
					</div>
				</div>
			{:else}
				{#each groupPurchases as purchase (purchase.id)}
					<PurchaseRecord {purchase} onEdit={onEditPurchase} />
				{/each}
			{/if}
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
