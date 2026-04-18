<script lang="ts">
	import { Card } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { Pencil, Trash2, Clock, Package } from '@lucide/svelte';
	import type { Budget, Expense } from '../states.svelte';
	import * as budgetState from '../states.svelte';
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

<div class="mx-auto mt-8 flex max-w-7xl flex-col justify-center">
	<div class="mb-6 flex items-center gap-3">
		<div class="bg-muted rounded-lg p-2">
			<Clock class="text-foreground h-5 w-5" />
		</div>
		<div>
			<h2 class="text-foreground text-lg font-bold md:text-xl">Recent Transactions</h2>
			<p class="text-muted-foreground text-xs">Last 12 expenses across all budgets</p>
		</div>
	</div>

	{#if allExpenses.length === 0}
		<Card class="border-dashed p-8 text-center md:p-12">
			<div class="mb-4 flex justify-center">
				<div class="bg-muted rounded-lg p-3">
					<Package class="text-muted-foreground h-6 w-6" />
				</div>
			</div>
			<p class="text-muted-foreground">No expenses yet. Add your first expense to get started.</p>
		</Card>
	{:else}
		<div
			class="grid w-full max-w-full grow grid-cols-1 place-items-stretch gap-3 md:grid-cols-2 lg:grid-cols-3"
		>
			{#each getSortedExpenses().slice(0, 12) as { budgetId, budgetName, expense }}
				{@const currency = getBudgetCurrency(budgetId)}
				<Card class="p-4 transition-all duration-150 hover:shadow-sm md:p-5">
					<div class="relative">
						<!-- Mobile layout: Stack everything vertically -->
						<div class="flex w-full flex-col gap-3 sm:hidden">
							<!-- Description -->
							<div class="flex items-start justify-between gap-2">
								<div
									class="text-foreground truncate text-sm font-semibold"
									title={expense.description}
								>
									{expense.description}
								</div>
								<div class="flex flex-shrink-0 gap-1">
									<Button
										variant="ghost"
										size="sm"
										class="h-7 w-7 p-0"
										onclick={() => openEditExpenseDialog(budgetId, expense)}
										title="Edit expense"
									>
										<Pencil class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										class="text-destructive hover:text-destructive h-7 w-7 p-0"
										onclick={() => handleDeleteExpense(budgetId, expense.id)}
										title="Delete expense"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
							<!-- Budget name and Amount -->
							<div class="flex items-center justify-between gap-2">
								<div class="text-muted-foreground bg-muted/50 truncate rounded px-2 py-1 text-xs">
									{budgetName}
								</div>
								<div class="shrink-0 text-sm font-bold">
									{getCurrencySymbol(currency)}{formatNumberWithCommas(expense.amount)}
								</div>
							</div>
							<!-- Date -->
							<div class="text-muted-foreground text-[11px]">
								{formatDate(expense.createdAt)}
							</div>
						</div>

						<!-- Desktop layout: Side by side -->
						<div class="hidden w-full items-center justify-between gap-3 sm:flex">
							<!-- Col 1: Description (takes remaining space) -->
							<div class="min-w-0 flex-1">
								<div
									class="text-foreground truncate text-sm font-semibold"
									title={expense.description}
								>
									{expense.description}
								</div>
								<div class="mt-2 flex items-center gap-2">
									<div class="text-muted-foreground bg-muted/50 truncate rounded px-2 py-1 text-xs">
										{budgetName}
									</div>
									<div class="text-muted-foreground shrink-0 text-[11px] whitespace-nowrap">
										{formatDate(expense.createdAt)}
									</div>
								</div>
							</div>

							<!-- Col 2: Amount and Actions -->
							<div class="flex flex-none items-center gap-2">
								<div class="text-right">
									<div class="text-sm font-bold">
										{getCurrencySymbol(currency)}{formatNumberWithCommas(expense.amount)}
									</div>
								</div>
								<div class="flex gap-1">
									<Button
										variant="ghost"
										size="sm"
										class="h-8 w-8 p-0"
										onclick={() => openEditExpenseDialog(budgetId, expense)}
										title="Edit expense"
									>
										<Pencil class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										class="text-destructive hover:text-destructive h-8 w-8 p-0"
										onclick={() => handleDeleteExpense(budgetId, expense.id)}
										title="Delete expense"
									>
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
