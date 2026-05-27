<script lang="ts">
	import { Card } from '@/ui/card';
	import * as Chart from '@/ui/chart';
	import * as ToggleGroup from '@/ui/toggle-group';
	import type { Expense } from '../../states.svelte';
	import { formatTrendChartData, getDateLabel } from '../../utils/chartData';
	import { AreaChart } from 'layerchart';
	import type { ChartConfig } from '@/ui/chart';

	type TimePeriod = 'week' | 'month' | 'year' | 'all';
	type TrendPoint = { date: Date; spent: number };

	interface Props {
		expenses: Expense[];
		formatNumber: (value: number) => string;
	}

	let { expenses, formatNumber }: Props = $props();

	let selectedPeriod = $state<TimePeriod>('month');

	const trendData = $derived(formatTrendChartData(expenses, selectedPeriod));
	const chartData = $derived.by<TrendPoint[]>(() =>
		trendData.map((point) => ({
			date: new Date(point.date),
			spent: point.spent
		}))
	);
	const chartConfig = {
		spent: {
			label: 'Spent',
			color: 'var(--chart-1)'
		}
	} satisfies ChartConfig;

	// Calculate total spent for current period
	const totalSpent = $derived(trendData.reduce((sum, d) => sum + d.spent, 0));
	const avgSpent = $derived(trendData.length > 0 ? totalSpent / trendData.length : 0);

	function formatTooltipLabel(value: Date | string) {
		if (value instanceof Date) {
			return value.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			});
		}

		return value;
	}
</script>

<Card class="p-4">
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-sm font-semibold">Spending Trends</h3>
				<p class="text-muted-foreground text-xs">Daily spending over selected period</p>
			</div>
			<ToggleGroup.Root type="single" bind:value={selectedPeriod}>
				<ToggleGroup.Item value="week" size="sm">Week</ToggleGroup.Item>
				<ToggleGroup.Item value="month" size="sm">Month</ToggleGroup.Item>
				<ToggleGroup.Item value="year" size="sm">Year</ToggleGroup.Item>
				<ToggleGroup.Item value="all" size="sm">All-time</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>

		{#if trendData.length === 0}
			<div class="bg-muted flex h-48 items-center justify-center rounded-lg">
				<p class="text-muted-foreground text-sm">No expense data for this period</p>
			</div>
		{:else}
			<div class="space-y-4">
				<!-- Summary stats -->
				<div class="grid grid-cols-2 gap-3">
					<div class="rounded-md border p-3">
						<p class="text-muted-foreground text-xs">Total Spent</p>
						<p class="text-foreground text-sm font-semibold">{formatNumber(totalSpent)}</p>
					</div>
					<div class="rounded-md border p-3">
						<p class="text-muted-foreground text-xs">Daily Average</p>
						<p class="text-foreground text-sm font-semibold">{formatNumber(avgSpent)}</p>
					</div>
				</div>

				<!-- LayerChart area chart -->
				<Chart.Container config={chartConfig} class="h-[280px] w-full">
					<AreaChart data={chartData} x="date" y="spent">
						{#snippet tooltip()}
							<Chart.Tooltip labelFormatter={formatTooltipLabel} />
						{/snippet}
					</AreaChart>
				</Chart.Container>

				<div class="text-muted-foreground flex items-center justify-between text-xs">
					<span>{getDateLabel(trendData[0]?.date ?? new Date().toISOString(), selectedPeriod)}</span
					>
					<span
						>{getDateLabel(
							trendData[trendData.length - 1]?.date ?? new Date().toISOString(),
							selectedPeriod
						)}</span
					>
				</div>
			</div>
		{/if}
	</div>
</Card>
