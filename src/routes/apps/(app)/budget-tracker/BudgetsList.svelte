<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import type { Budget, Expense } from '$lib/stores/budgetStore';
	import { budgetStore } from '$lib/stores/budgetStore';

	interface Props {
		openEditDialog: (budget: Budget) => void;
		openEditExpenseDialog: (budgetId: string, expense: Expense) => void;
		getProgressPercentage: (budget: Budget) => number;
		getProgressBarColor: (percentage: number) => string;
		formatCurrency: (amount: number, currency: string) => string;
		calculateTotalExpenses: (expenses: Expense[]) => number;
	}

	let {
		openEditDialog,
		openEditExpenseDialog,
		getProgressPercentage,
		getProgressBarColor,
		formatCurrency,
		calculateTotalExpenses
	}: Props = $props();
</script>

<div id="budgets-list" class="grid gap-4 md:grid-cols-2">
	{#each $budgetStore as budget}
		<Card id="budget-{budget.id}" class="p-6 transition-all hover:shadow-md">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold">{budget.name}</h3>
				<div class="flex gap-2">
					<Button variant="ghost" size="icon" onclick={() => openEditDialog(budget)}>
						<Pencil class="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" onclick={() => budgetStore.deleteBudget(budget.id)}>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
			</div>

			<!-- Progress Bar -->
			<div class="mb-4">
				<div class="mb-4">
					<Progress
						value={getProgressPercentage(budget)}
						max={100}
						classInner="bg-green-400 transition-all {getProgressBarColor(
							getProgressPercentage(budget)
						)}"
						class="h-3 w-full"
					/>
				</div>

				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span>Budget:</span>
						<span class="font-semibold">{budget.amount}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span>Spent:</span>
						<span class="font-semibold"
							>{formatCurrency(calculateTotalExpenses(budget.expenses), budget.currency)}</span
						>
					</div>
					<div class="flex justify-between text-sm">
						<span>Remaining:</span>
						<span class="font-semibold">
							{formatCurrency(
								budget.amount - calculateTotalExpenses(budget.expenses),
								budget.currency
							)}
						</span>
					</div>
				</div>

				{#if budget.expenses.length > 0}
					<div class="mt-4">
						<h4 class="mb-2 font-semibold">Expenses</h4>
						<div class="space-y-2">
							{#each budget.expenses as expense}
								<div class="flex items-center justify-between text-sm">
									<span>{expense.description}</span>
									<div class="flex items-center gap-2">
										<span>{formatCurrency(expense.amount, budget.currency)}</span>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => openEditExpenseDialog(budget.id, expense)}
										>
											<Pencil class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onclick={() => budgetStore.deleteExpense(budget.id, expense.id)}
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</Card>
	{/each}
</div>
