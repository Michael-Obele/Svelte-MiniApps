<script lang="ts">
	import { Card } from '@/ui/card';
	import type { Expense } from '../../states.svelte';
	import { formatCategoryChartData } from '../../utils/chartData';
	import { PieChart, Tooltip } from 'layerchart';

	interface Props {
		expenses: Expense[];
		formatNumber: (value: number) => string;
	}

	let { expenses, formatNumber }: Props = $props();

	const chartData = $derived(formatCategoryChartData(expenses));
	const displayData = $derived.by(() => {
		if (chartData.length <= 5) {
			return chartData;
		}

		const visibleItems = chartData.slice(0, 4);
		const otherItems = chartData.slice(4);
		const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);
		const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

		return [
			...visibleItems,
			{
				name: 'Other',
				value: otherValue,
				percentage: totalValue > 0 ? (otherValue / totalValue) * 100 : 0
			}
		];
	});
	const totalSpent = $derived(displayData.reduce((sum, item) => sum + item.value, 0));
	const hiddenItemCount = $derived(chartData.length > 5 ? chartData.length - 4 : 0);
	const leadItem = $derived(chartData[0] ?? null);
	const colorVars = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];
</script>

<Card class="p-4">
	<div class="space-y-4 p-1">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h3 class="text-sm font-semibold">Top Spending Items</h3>
				<p class="text-muted-foreground text-xs">
					Part-to-whole view of the biggest expense descriptions in this budget
				</p>
			</div>
			{#if leadItem}
				<div class="bg-muted/20 rounded-2xl border px-3 py-2 text-right">
					<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
						Largest item
					</p>
					<p class="text-foreground max-w-32 truncate text-sm font-semibold">{leadItem.name}</p>
				</div>
			{/if}
		</div>

		{#if displayData.length === 0}
			<div class="bg-muted flex h-48 items-center justify-center rounded-lg">
				<p class="text-muted-foreground text-sm">No expense data yet</p>
			</div>
		{:else}
			<div class="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-center">
				<div class="relative h-[220px] w-full">
					<PieChart
						data={displayData}
						key="name"
						value="value"
						innerRadius={-30}
						cRange={colorVars}
					>
						{#snippet tooltip()}
							<Tooltip.Root>
								{#snippet children({ data })}
									<div class="bg-background rounded border px-2 py-1 text-xs shadow-sm">
										<p class="font-medium">{data.name}</p>
										<p class="text-muted-foreground">
											{formatNumber(data.value)} · {data.percentage?.toFixed(1)}%
										</p>
									</div>
								{/snippet}
							</Tooltip.Root>
						{/snippet}
					</PieChart>

					<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
						<div
							class="bg-background/90 rounded-full border px-4 py-3 text-center shadow-sm backdrop-blur"
						>
							<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
								Total spent
							</p>
							<p class="text-foreground text-sm font-semibold">{formatNumber(totalSpent)}</p>
						</div>
					</div>
				</div>

				<div class="space-y-3">
					{#each displayData as category, idx (category.name)}
						<div class="bg-muted/20 rounded-2xl border p-3">
							<div class="flex items-start justify-between gap-3">
								<div class="flex min-w-0 items-center gap-2">
									<div
										class="h-2.5 w-2.5 flex-shrink-0 rounded-full"
										style="background-color: {colorVars[idx % colorVars.length]}"
									></div>
									<div class="min-w-0">
										<p class="text-foreground truncate text-sm font-medium">{category.name}</p>
										<p class="text-muted-foreground text-xs">{formatNumber(category.value)}</p>
									</div>
								</div>
								<p class="text-foreground flex-shrink-0 text-sm font-semibold">
									{category.percentage?.toFixed(1)}%
								</p>
							</div>
						</div>
					{/each}
					{#if hiddenItemCount > 0}
						<p class="text-muted-foreground text-xs">
							Grouped {hiddenItemCount} smaller items into Other.
						</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</Card>
