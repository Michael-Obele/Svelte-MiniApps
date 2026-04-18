<script lang="ts">
	import { Card } from '@/ui/card';
	import { TrendingDown, TrendingUp, Wallet, CircleAlert, CircleCheck } from '@lucide/svelte';
	import type { Budget } from '../states.svelte';

	interface Props {
		budget: Budget;
		formatNumber: (value: number) => string;
	}

	let { budget, formatNumber }: Props = $props();

	const spent = $derived(budget.expenses.reduce((sum, exp) => sum + exp.amount, 0));
	const remaining = $derived(budget.amount - spent);
	const percentUsed = $derived(Math.min((spent / budget.amount) * 100, 100));
	const isOverBudget = $derived(spent > budget.amount);
</script>

<div class="grid gap-4 md:grid-cols-3">
	<!-- Budget Allocated Card -->
	<Card class="border-l-primary border-l-4 p-4 md:p-6">
		<div class="flex items-start justify-between">
			<div class="space-y-2">
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
					Budget Allocated
				</p>
				<p class="text-foreground text-2xl font-bold md:text-3xl">{formatNumber(budget.amount)}</p>
				<p class="text-muted-foreground text-xs">{budget.currency}</p>
			</div>
			<div class="bg-muted rounded-lg p-3">
				<Wallet class="text-foreground h-5 w-5" />
			</div>
		</div>
	</Card>

	<!-- Total Spent Card -->
	<Card
		class="border-l-4 p-4 md:p-6 {isOverBudget ? 'border-l-destructive' : 'border-l-orange-500'}"
	>
		<div class="flex items-start justify-between">
			<div class="space-y-2">
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Total Spent</p>
				<p
					class={`text-2xl font-bold md:text-3xl ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}
				>
					{formatNumber(spent)}
				</p>
				<p class={`text-xs ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
					{percentUsed.toFixed(1)}% of budget
				</p>
			</div>
			<div class="bg-muted rounded-lg p-3">
				<TrendingDown class={`h-5 w-5 ${isOverBudget ? 'text-destructive' : 'text-foreground'}`} />
			</div>
		</div>
	</Card>

	<!-- Remaining Card -->
	<Card
		class="border-l-4 p-4 md:p-6 {isOverBudget ? 'border-l-destructive' : 'border-l-green-500'}"
	>
		<div class="flex items-start justify-between">
			<div class="space-y-2">
				<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Remaining</p>
				<p
					class={`text-2xl font-bold md:text-3xl ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}
				>
					{formatNumber(Math.max(remaining, 0))}
				</p>
				<p
					class={`flex items-center gap-1 text-xs ${isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
				>
					{#if isOverBudget}
						<CircleAlert class="h-3.5 w-3.5" />
						Over budget
					{:else}
						<CircleCheck class="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
						Available
					{/if}
				</p>
			</div>
			<div class="bg-muted rounded-lg p-3">
				<TrendingUp class={`h-5 w-5 ${isOverBudget ? 'text-destructive' : 'text-foreground'}`} />
			</div>
		</div>
	</Card>
</div>
