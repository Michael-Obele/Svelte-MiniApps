<script lang="ts">
	import * as budgetState from './states.svelte';
	import type { Budget } from './states.svelte';
	import { Button } from '@/ui/button';
	import { Card } from '@/ui/card';
	import { Progress } from '@/ui/progress/index.js';
	import { tick } from 'svelte';

	let { getProgressBarColor } = $props();
	
	// Reactive store reference for budgets
	let budgets = $state<Budget[]>([]);

	// Subscribe to the budget state
	let unsubscribe: () => void;
	$effect.root(() => {
		unsubscribe = budgetState.budgets.subscribe((value) => {
			budgets = value;
		});

		return () => {
			if (unsubscribe) unsubscribe();
		};
	});

	function calculateTotalExpenses(expenses: any[]): number {
		return expenses.reduce((total, expense) => total + expense.amount, 0);
	}

	async function scrollToBudget(budgetId: string) {
		await tick();
		const element = document.getElementById(`budget-${budgetId}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function getProgressPercentage(budget: Budget): number {
		const spent = calculateTotalExpenses(budget.expenses);
		return Math.min((spent / budget.amount) * 100, 100);
	}
</script>

<Card class="">
	<div class="p-4">
		<h2 class="mb-2 text-sm font-semibold text-muted-foreground">Quick Navigation</h2>
		<div class="flex flex-wrap gap-2">
			{#each budgets as budget}
				<Button
					variant="outline"
					size="sm"
					onclick={() => scrollToBudget(budget.id)}
					class="flex items-center gap-2"
				>
					<span>{budget.name}</span>
					<Progress
						value={getProgressPercentage(budget)}
						max={100}
						classInner="bg-green-400 transition-all {getProgressBarColor(
							getProgressPercentage(budget)
						)}"
						class="h-2 w-20"
					/>
				</Button>
			{/each}
		</div>
	</div>
</Card>
