<script lang="ts">
	import { Card } from '@/ui/card';
	import * as Chart from '@/ui/chart';
	import * as ToggleGroup from '@/ui/toggle-group';
	import type { Expense } from '$lib/budget-tracker/states.svelte';
	import {
		formatTrendChartData,
		getDateLabel
	} from '../../../../routes/apps/(app)/budget-tracker/utils/chartData';
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
	const peakSpend = $derived(Math.max(...trendData.map((entry) => entry.spent), 0));
	const latestSpend = $derived(trendData[trendData.length - 1]?.spent ?? 0);

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

<Card class="overflow-hidden p-4 sm:p-5">
	<div class="space-y-5">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
			<div class="space-y-1">
				<h3 class="text-sm font-semibold">Spending pace</h3>
				<p class="text-muted-foreground text-xs leading-5">
					Track how spending is moving over time, then compare peak days with the current pace.
				</p>
			</div>
			<div class="overflow-x-auto pb-1">
				<ToggleGroup.Root type="single" bind:value={selectedPeriod} class="flex min-w-max gap-1">
					<ToggleGroup.Item value="week" size="sm" class="min-w-[3.25rem] rounded-xl px-3">
						7D
					</ToggleGroup.Item>
					<ToggleGroup.Item value="month" size="sm" class="min-w-[3.25rem] rounded-xl px-3">
						30D
					</ToggleGroup.Item>
					<ToggleGroup.Item value="year" size="sm" class="min-w-[3.25rem] rounded-xl px-3">
						Year
					</ToggleGroup.Item>
					<ToggleGroup.Item value="all" size="sm" class="min-w-[3.25rem] rounded-xl px-3">
						All
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</div>
		</div>

		{#if trendData.length === 0}
			<div class="bg-muted flex h-48 items-center justify-center rounded-lg">
				<p class="text-muted-foreground text-sm">No expense data for this period</p>
			</div>
		{:else}
			<div class="space-y-4">
				<div class="flex flex-col gap-3 sm:flex-row">
					<div class="rounded-2xl border p-3 sm:flex-1">
						<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
							Total spent
						</p>
						<p class="text-foreground mt-2 text-sm font-semibold">{formatNumber(totalSpent)}</p>
					</div>
					<div class="rounded-2xl border p-3 sm:flex-1">
						<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
							Average
						</p>
						<p class="text-foreground mt-2 text-sm font-semibold">{formatNumber(avgSpent)}</p>
					</div>
					<div class="rounded-2xl border p-3 sm:flex-1">
						<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
							Peak day
						</p>
						<p class="text-foreground mt-2 text-sm font-semibold">{formatNumber(peakSpend)}</p>
					</div>
				</div>

				<div class="overflow-x-auto pb-1">
					<div class="min-w-[18rem]">
						<Chart.Container
							config={chartConfig}
							class="h-[220px] w-full overflow-hidden sm:h-[280px]"
						>
							<AreaChart data={chartData} x="date" y="spent">
								{#snippet tooltip()}
									<Chart.Tooltip labelFormatter={formatTooltipLabel} />
								{/snippet}
							</AreaChart>
						</Chart.Container>
					</div>
				</div>

				<div
					class="text-muted-foreground flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between"
				>
					<span>{getDateLabel(trendData[0]?.date ?? new Date().toISOString(), selectedPeriod)}</span
					>
					<span>Latest interval: {formatNumber(latestSpend)}</span>
					<span>
						{getDateLabel(
							trendData[trendData.length - 1]?.date ?? new Date().toISOString(),
							selectedPeriod
						)}
					</span>
				</div>
			</div>
		{/if}
	</div>
</Card>
