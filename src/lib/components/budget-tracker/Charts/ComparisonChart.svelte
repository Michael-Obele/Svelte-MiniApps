<script lang="ts">
	import { Card } from '@/ui/card';
	import * as Chart from '@/ui/chart';
	import type { ChartConfig } from '@/ui/chart';
	import type { Budget } from '$lib/budget-tracker/states.svelte';
	import { BarChart, Tooltip } from 'layerchart';

	interface Props {
		budget: Budget;
		formatNumber: (value: number) => string;
	}

	let { budget, formatNumber }: Props = $props();

	const spent = $derived(budget.expenses.reduce((sum, exp) => sum + exp.amount, 0));
	const remaining = $derived(Math.max(budget.amount - spent, 0));
	const percentSpent = $derived(budget.amount > 0 ? (spent / budget.amount) * 100 : 0);
	const chartConfig = {
		value: {
			label: 'Amount',
			color: 'var(--chart-1)'
		}
	} satisfies ChartConfig;

	// Simple two-bar comparison: Allocated vs Spent
	const chartData = $derived([
		{ label: 'Budget', value: budget.amount },
		{ label: 'Spent', value: spent },
		{ label: 'Left', value: remaining }
	]);
</script>

<Card class="overflow-hidden p-4 sm:p-5">
	<div class="space-y-5">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div class="space-y-1">
				<h3 class="text-sm font-semibold">Budget balance</h3>
				<p class="text-muted-foreground text-xs leading-5">
					A clearer read on the budget cap, current spend, and how much room is still available.
				</p>
			</div>
			<div
				class={`rounded-2xl border px-3 py-2 text-right ${
					percentSpent >= 100
						? 'border-destructive/30 bg-destructive/5 text-destructive'
						: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
				}`}
			>
				<p class="text-[11px] font-medium tracking-wide uppercase">Used</p>
				<p class="text-sm font-semibold">{percentSpent.toFixed(0)}%</p>
			</div>
		</div>

		{#if spent === 0}
			<div class="bg-muted flex h-48 items-center justify-center rounded-lg">
				<p class="text-muted-foreground text-sm">No expenses recorded yet</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3 sm:flex-row">
				<div class="bg-muted/20 flex-1 rounded-2xl border p-3">
					<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
						Budget
					</p>
					<p class="text-foreground mt-2 text-sm font-semibold">{formatNumber(budget.amount)}</p>
				</div>
				<div class="bg-muted/20 flex-1 rounded-2xl border p-3">
					<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">Spent</p>
					<p class="text-foreground mt-2 text-sm font-semibold">{formatNumber(spent)}</p>
				</div>
				<div class="bg-muted/20 flex-1 rounded-2xl border p-3">
					<p class="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">Left</p>
					<p class="text-foreground mt-2 text-sm font-semibold">{formatNumber(remaining)}</p>
				</div>
			</div>

			<div class="overflow-x-auto pb-1">
				<div class="min-w-[18rem]">
					<Chart.Container
						config={chartConfig}
						class="h-[220px] w-full overflow-hidden sm:h-[260px]"
					>
						<BarChart
							data={chartData}
							x="label"
							y="value"
							axis="x"
							series={[{ key: 'value', value: 'value', color: 'var(--chart-1)' }]}
						>
							{#snippet tooltip()}
								<Tooltip.Root>
									{#snippet children({ data })}
										<div class="bg-background rounded border px-2 py-1 text-xs shadow-sm">
											<p class="font-medium">{data.label}</p>
											<p class="text-muted-foreground">{formatNumber(data.value)}</p>
										</div>
									{/snippet}
								</Tooltip.Root>
							{/snippet}
						</BarChart>
					</Chart.Container>
				</div>
			</div>
		{/if}
	</div>
</Card>
