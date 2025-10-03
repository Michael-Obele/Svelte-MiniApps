<script lang="ts">
	import { History, CalendarRange, List } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Badge } from '@/ui/badge';
	import * as purchaseState from './states.svelte';
	import PurchaseRecord from './PurchaseRecord.svelte';

	interface Props {
		onEditPurchase: (purchase: any) => void;
	}

	let { onEditPurchase }: Props = $props();

	let groupByDate = $state(true);

	// Get all purchases with item information
	let purchasesWithItems = $derived(purchaseState.getPurchasesWithItems());

	function formatMonthYear(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
	}

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency || 'USD'
		}).format(amount);
	}

	// Group purchases by month and year
	let groupedPurchases = $derived.by(() => {
		if (!groupByDate) return { 'All Purchases': purchasesWithItems };

		const grouped: Record<string, typeof purchasesWithItems> = {};
		purchasesWithItems.forEach((purchase) => {
			const monthYear = formatMonthYear(purchase.date);
			if (!grouped[monthYear]) {
				grouped[monthYear] = [];
			}
			grouped[monthYear].push(purchase);
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
				variant={groupByDate ? 'default' : 'outline'}
				size="sm"
				onclick={() => (groupByDate = true)}
				class="h-9"
			>
				<CalendarRange class="mr-1.5 h-4 w-4" />
				By Month
			</Button>
			<Button
				variant={!groupByDate ? 'default' : 'outline'}
				size="sm"
				onclick={() => (groupByDate = false)}
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
			{#if groupByDate}
				{@const groupStats = getGroupStats(groupPurchases)}
				<div class="space-y-4">
					<div
						class="sticky top-0 z-10 flex items-center justify-between rounded-lg bg-gray-100 px-4 py-3 backdrop-blur-sm dark:bg-gray-800"
					>
						<div class="flex items-center gap-2">
							<CalendarRange class="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
