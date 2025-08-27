<script lang="ts">
	import { Card } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { Pencil, Trash2 } from '@lucide/svelte';
	import type { Budget, Expense } from './states.svelte';
	import * as budgetState from './states.svelte';
	import { toast } from 'svelte-sonner';

	// Props with proper typing
	interface Props {
		budgets: Budget[];
		openEditExpenseDialog: (budgetId: string, expense: Expense) => void;
		getCurrencySymbol: (currencyCode: string) => string;
		formatNumberWithCommas: (value: string | number) => string;
	}

	let {
		budgets = $bindable<Budget[]>([]),
		openEditExpenseDialog,
		getCurrencySymbol,
		formatNumberWithCommas
	}: Props = $props();

	// Make allExpenses reactive using $state
	let allExpenses = $state(budgetState.getAllExpenses());

	// Subscribe to budget changes and update allExpenses
	let unsubscribe: () => void;
	$effect.root(() => {
		unsubscribe = budgetState.budgets.subscribe(() => {
			// Update allExpenses whenever budgets change
			allExpenses = budgetState.getAllExpenses();
		});

		return () => {
			if (unsubscribe) unsubscribe();
		};
	});

	// Get sorted expenses (most recent first)
	function getSortedExpenses() {
		return [...allExpenses].sort((a, b) => {
			return new Date(b.expense.createdAt).getTime() - new Date(a.expense.createdAt).getTime();
		});
	}

	// Function to delete an expense
	function handleDeleteExpense(budgetId: string, expenseId: string) {
		if (confirm('Are you sure you want to delete this expense?')) {
			budgetState.deleteExpense(budgetId, expenseId);
			toast.success('Expense deleted successfully');
		}
	}

	// Function to get the currency for a budget
	function getBudgetCurrency(budgetId: string): string {
		const budget = budgetState.findBudget(budgetId);
		return budget ? budget.currency : 'USD';
	}

	// Format date to a readable format with time
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const formattedDate = date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});

		// Add time in a concise format (12-hour with AM/PM)
		const formattedTime = date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});

		return `${formattedDate}, ${formattedTime}`;
	}
</script>

<div class="mt-8">
	<h2 class="mx-auto mb-4 text-xl font-semibold">
		Latest Transactions <span class="text-xs font-normal text-muted-foreground"
			>(showing 10 most recent)</span
		>
	</h2>
	<!-- <p class="mb-4 text-sm text-muted-foreground">{allExpenses.length} expenses</p> -->

	{#if allExpenses.length === 0}
		<div class="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
			<p>No expenses yet. Add your first expense to get started.</p>
		</div>
	{:else}
		<div class="flex w-full flex-row flex-wrap gap-3">
			{#each getSortedExpenses().slice(0, 10) as { budgetId, budgetName, expense }}
				{@const currency = getBudgetCurrency(budgetId)}
				<Card class="w-full flex-auto p-4 transition-shadow hover:shadow-sm sm:w-1/2 md:w-1/3">
					<div class="flex items-center justify-between gap-4">
						<!-- Left: content that can truncate -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="block truncate font-medium" title={expense.description}
									>{expense.description}</span
								>
								<span class="text-xs text-muted-foreground">({budgetName})</span>
							</div>
							<div class="mt-1 text-sm text-muted-foreground">{formatDate(expense.createdAt)}</div>
						</div>

						<!-- Right: amount (no-wrap) -->
						<div class="ml-4 flex flex-col items-end">
							<div class="whitespace-nowrap font-semibold">
								{getCurrencySymbol(currency)}{formatNumberWithCommas(expense.amount)}
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
