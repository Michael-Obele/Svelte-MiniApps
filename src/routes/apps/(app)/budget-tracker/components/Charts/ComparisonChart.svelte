<script lang="ts">
	import { Card } from '@/ui/card';
	import type { Budget } from '../../states.svelte';
	import { BarChart, Tooltip } from 'layerchart';

	interface Props {
		budget: Budget;
		formatNumber: (value: number) => string;
	}

	let { budget, formatNumber }: Props = $props();

	const spent = $derived(budget.expenses.reduce((sum, exp) => sum + exp.amount, 0));
	const remaining = $derived(Math.max(budget.amount - spent, 0));

	// Simple two-bar comparison: Allocated vs Spent
	const chartData = $derived([
		{ label: 'Allocated', value: budget.amount },
		{ label: 'Spent', value: spent },
		{ label: 'Remaining', value: remaining }
	]);
</script>

<Card class="p-4">
	<div class="space-y-4">
		<div>
			<h3 class="text-sm font-semibold">Budget vs Spent</h3>
			<p class="text-muted-foreground text-xs">
				Comparison of allocated budget and actual spending
			</p>
		</div>

		{#if spent === 0}
			<div class="bg-muted flex h-48 items-center justify-center rounded-lg">
				<p class="text-muted-foreground text-sm">No expenses recorded yet</p>
			</div>
		{:else}
			<BarChart
				data={chartData}
				x="label"
				y="value"
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
		{/if}
	</div>
</Card>
