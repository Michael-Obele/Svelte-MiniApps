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
	<h2 class="mb-4 text-xl font-semibold">
		Latest Transactions <span class="text-xs font-normal text-muted-foreground"
			>(showing 10 most recent)</span
		>
	</h2>
	<p class="mb-4 text-sm text-muted-foreground">{allExpenses.length} expenses</p>

	{#if allExpenses.length === 0}
		<div class="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
			<p>No expenses yet. Add your first expense to get started.</p>
		</div>
	{:else}
		<div class="w-full space-y-3">
			{#each getSortedExpenses().slice(0, 10) as { budgetId, budgetName, expense }}
				{@const currency = getBudgetCurrency(budgetId)}
				<Card class="p-4 transition-shadow hover:shadow-sm">
					<div class="flex items-center justify-between">
						<div>
							<div class="flex items-center gap-2">
								<span class="inline-block max-w-[200px] truncate align-bottom font-medium"
									>{expense.description}</span
								>
								<span class="text-xs text-muted-foreground">({budgetName})</span>
							</div>
							<div class="text-sm text-muted-foreground">
								{formatDate(expense.createdAt)}
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="font-semibold">
								{getCurrencySymbol(currency)}{formatNumberWithCommas(expense.amount)}
							</div>
							<div class="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8"
									onclick={() => openEditExpenseDialog(budgetId, expense)}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									class="h-8 w-8 text-destructive"
									onclick={() => handleDeleteExpense(budgetId, expense.id)}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
