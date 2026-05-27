<script lang="ts">
	import { Card } from '@/ui/card';
	import { Activity, CircleAlert, TrendingDown, TrendingUp, Wallet } from '@lucide/svelte';
	import type { Budget } from '../states.svelte';

	interface Props {
		budget: Budget;
		formatNumber: (value: number) => string;
	}

	let { budget, formatNumber }: Props = $props();

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	const spent = $derived(budget.expenses.reduce((sum, exp) => sum + exp.amount, 0));
	const remaining = $derived(budget.amount - spent);
	const percentUsed = $derived(
		budget.amount > 0 ? clamp((spent / budget.amount) * 100, 0, 100) : spent > 0 ? 100 : 0
	);
	const isOverBudget = $derived(spent > budget.amount);
	const isNearLimit = $derived(!isOverBudget && percentUsed >= 80);
</script>

<div class="grid gap-4 md:grid-cols-3">
	<!-- Budget Allocated Card -->
	<Card class="bg-card flex flex-col justify-between p-6 shadow-sm">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<p class="text-muted-foreground text-sm font-medium">Budget Allocated</p>
				<Wallet class="text-muted-foreground size-4" />
			</div>

			<div class="space-y-1">
				<h3 class="text-2xl font-bold tracking-tight">{formatNumber(budget.amount)}</h3>
				<div class="flex items-center gap-2 text-sm">
					<div
						class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400"
					>
						<div class="size-1.5 rounded-full bg-emerald-500"></div>
						<span class="text-xs font-medium">Active Base</span>
					</div>
					<span class="text-muted-foreground">{budget.expenses.length} expenses</span>
				</div>
			</div>
		</div>
	</Card>

	<!-- Total Spent Card -->
	<Card class="bg-card flex flex-col justify-between p-6 shadow-sm">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<p class="text-muted-foreground text-sm font-medium">Total Spent</p>
				<Activity class="text-muted-foreground size-4" />
			</div>

			<div class="space-y-1">
				<h3 class="text-2xl font-bold tracking-tight">{formatNumber(spent)}</h3>
				<div class="flex items-center gap-2 text-sm">
					{#if isOverBudget}
						<div
							class="bg-destructive/10 text-destructive flex items-center gap-1.5 rounded-full px-2 py-0.5"
						>
							<div class="bg-destructive size-1.5 animate-pulse rounded-full"></div>
							<span class="text-xs font-medium">Over Limit</span>
						</div>
					{:else if isNearLimit}
						<div
							class="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-600 dark:text-orange-400"
						>
							<div class="size-1.5 rounded-full bg-orange-500"></div>
							<span class="text-xs font-medium">Near Limit</span>
						</div>
					{:else}
						<div
							class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400"
						>
							<div class="size-1.5 rounded-full bg-emerald-500"></div>
							<span class="text-xs font-medium">On Track</span>
						</div>
					{/if}
					<span class="text-muted-foreground">{percentUsed.toFixed(1)}% used</span>
				</div>
			</div>
		</div>
	</Card>

	<!-- Remaining Card -->
	<Card class="bg-card flex flex-col justify-between p-6 shadow-sm">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<p class="text-muted-foreground text-sm font-medium">Remaining</p>
				{#if isOverBudget}
					<TrendingDown class="text-destructive size-4" />
				{:else}
					<TrendingUp class="size-4 text-emerald-500" />
				{/if}
			</div>

			<div class="space-y-1">
				<h3 class="text-2xl font-bold tracking-tight">{formatNumber(Math.max(remaining, 0))}</h3>
				<div class="flex items-center gap-2 text-sm">
					{#if isOverBudget}
						<div class="text-destructive flex items-center gap-1.5">
							<CircleAlert class="size-3.5" />
							<span class="text-xs font-medium"
								>Exceeded by {formatNumber(Math.abs(remaining))}</span
							>
						</div>
					{:else}
						<span class="text-muted-foreground">Available balance</span>
					{/if}
				</div>
			</div>
		</div>
	</Card>
</div>
