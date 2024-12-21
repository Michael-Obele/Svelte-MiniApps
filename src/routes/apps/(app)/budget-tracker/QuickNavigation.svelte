<script lang="ts">
	import { budgetStore } from '$lib/stores/budgetStore';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { tick } from 'svelte';

	let { getProgressBarColor } = $props();

	$effect(() => {
		budgetStore.loadBudgets();
	});

	function calculateTotalExpenses(expenses: any[]): number {
		return expenses.reduce((total, expense) => total + expense.amount, 0);
	}

	// Add function to scroll to budget
	async function scrollToBudget(budgetId: string) {
		await tick();
		const element = document.getElementById(`budget-${budgetId}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// Add function to get progress percentage
	function getProgressPercentage(budget: any): number {
		const spent = calculateTotalExpenses(budget.expenses);
		return Math.min((spent / budget.amount) * 100, 100);
	}
</script>

<Card class="">
	<div class="p-4">
		<h2 class="mb-2 text-sm font-semibold text-muted-foreground">Quick Navigation</h2>
		<div class="flex flex-wrap gap-2">
			{#each $budgetStore as budget}
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
