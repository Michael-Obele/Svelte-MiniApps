<script lang="ts">
	import FloatingBtn from './FloatingBtn.svelte';
	import BudgetDialog from './BudgetDialog.svelte';
	import QuickNavigation from './QuickNavigation.svelte';
	import * as Select from '$lib/components/ui/select';
	import { budgetStore, type Budget, type Expense } from '$lib/stores/budgetStore';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card } from '$lib/components/ui/card';
	import { PlusCircle, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { ArrowUp } from 'lucide-svelte';
	import { Pencil } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import ExpenseDialog from './ExpenseDialog.svelte';

	let budgetName = $state('');
	let budgetAmount = $state('');
	let selectedBudgetId = $state('');
	let selectedBudgetName = $state('Select Budget');
	let expenseDescription = $state('');
	let expenseAmount = $state('');
	let editingExpense = $state<{ budgetId: string; expense: Expense } | null>(null);
	let editExpenseDescription = $state('');
	let editExpenseAmount = $state('');

	$effect(() => {
		budgetStore.loadBudgets();
	});

	let isSticky = $state(false);
	let navigationCard = $state();
	let formsSection: HTMLElement;

	// Add supported currencies
	const currencies = [
		{ value: 'USD', label: 'US Dollar ($)', symbol: '$' },
		{ value: 'EUR', label: 'Euro (€)', symbol: '€' },
		{ value: 'GBP', label: 'British Pound (£)', symbol: '£' },
		{ value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
		{ value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' }
	];

	let selectedCurrency = $state('USD');

	$effect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				isSticky = !entry.isIntersecting;
			},
			{ threshold: 0.2 }
		);

		if (formsSection) {
			observer.observe(formsSection);
		}

		return () => observer.disconnect();
	});

	function addBudget() {
		if (!budgetName || !budgetAmount || !selectedCurrency) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetStore.addBudget(budgetName, Number(budgetAmount), selectedCurrency);
		toast.success('Budget added successfully');
		budgetName = '';
		budgetAmount = '';
		selectedCurrency = 'USD';
	}

	function addExpense() {
		if (!selectedBudgetId || !expenseDescription || !expenseAmount) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetStore.addExpense(selectedBudgetId, expenseDescription, Number(expenseAmount));
		toast.success('Expense added successfully');
		expenseDescription = '';
		expenseAmount = '';
		selectedBudgetId = '';
		selectedBudgetName = 'Select Budget'; // Reset the name
	}

	function formatCurrency(amount: number, currency: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}

	function calculateTotalExpenses(expenses: Expense[]): number {
		return expenses.reduce((total, expense) => total + expense.amount, 0);
	}

	function updateExpense() {
		if (!editingExpense) {
			toast.error('No expense selected for editing');
			return;
		}

		if (!editExpenseDescription || !editExpenseAmount) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetStore.updateExpense(
			editingExpense.budgetId,
			editingExpense.expense.id,
			editExpenseDescription,
			Number(editExpenseAmount)
		);
		toast.success('Expense updated successfully');
		editingExpense = null;
	}

	// Function to get progress percentage
	function getProgressPercentage(budget: Budget): number {
		const spent = calculateTotalExpenses(budget.expenses ?? []);
		return Math.min((spent / budget.amount) * 100, 100);
	}

	function getProgressBarColor(percentage: number): string {
		if (percentage >= 90) return 'bg-destructive dark:bg-destructive';
		if (percentage >= 75) return 'bg-yellow-500 dark:bg-yellow-500';
		if (percentage <= 50) return 'bg-emerald-500 dark:bg-emerald-500';
		return '';
	}

	function openEditExpenseDialog(budgetId: string, expense: Expense) {
		editingExpense = { budgetId, expense };
		editExpenseDescription = expense.description;
		editExpenseAmount = String(expense.amount);
	}

	// Add these state variables
	let editingBudget = $state<Budget | null>(null);
	let editBudgetName = $state('');
	let editBudgetAmount = $state('');
	let editBudgetCurrency = $state('');

	// Add this function to handle budget updates
	function updateBudget() {
		if (!editingBudget) {
			toast.error('No budget selected for editing');
			return;
		}

		if (!editBudgetName || !editBudgetAmount || !editBudgetCurrency) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetStore.updateBudget(
			editingBudget.id,
			editBudgetName,
			Number(editBudgetAmount),
			editBudgetCurrency
		);
		toast.success('Budget updated successfully');
		editingBudget = null;
	}

	// Add function to open edit dialog
	function openEditDialog(budget: Budget) {
		editingBudget = budget;
		editBudgetName = budget.name;
		editBudgetAmount = String(budget.amount);
		editBudgetCurrency = budget.currency;
	}
</script>

<div class="container mx-auto max-w-4xl space-y-8 p-4">
	<div class="space-y-4">
		<h1 class="text-3xl font-bold tracking-tight">Budget Tracker</h1>

		<!-- Quick Navigation -->
		{#if $budgetStore.length > 0}
			<QuickNavigation {getProgressBarColor} />
		{/if}

		<!-- Forms Section -->
		<section bind:this={formsSection}>
			<!-- Add Budget Form -->
			<Card class="p-6">
				<h2 class="mb-4 text-xl font-semibold">Add New Budget</h2>
				<div class="flex flex-col gap-4 sm:flex-row">
					<Input bind:value={budgetName} placeholder="Budget Name" class="flex-1" />
					<Input bind:value={budgetAmount} type="number" placeholder="Amount" class="w-32" />
					<Select.Root type="single" bind:value={selectedCurrency}>
						<Select.Trigger class="w-[180px]">{selectedCurrency}</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.GroupHeading>Currency</Select.GroupHeading>
								{#each currencies as currency}
									<Select.Item value={currency.value} label={currency.label}
										>{currency.label}</Select.Item
									>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>

					<Button onclick={addBudget}>
						<PlusCircle class="mr-2 h-4 w-4" />
						Add Budget
					</Button>
				</div>
			</Card>

			<!-- Add Expense Form -->
			<Card class="p-6">
				<h2 class="mb-4 text-xl font-semibold">Add Expense</h2>
				<div class="flex flex-col gap-4 sm:flex-row">
					<Select.Root
						type="single"
						bind:value={selectedBudgetId}
						onValueChange={(value) => {
							const budget = $budgetStore.find((b) => b.id === value);
							console.log('budget:', budget);
							selectedBudgetName = budget ? budget.name : 'Select Budget';
						}}
					>
						<Select.Trigger class="flex-1">{selectedBudgetName}</Select.Trigger>
						<Select.Content>
							{#each $budgetStore as budget}
								<Select.Item value={budget.id}>
									{budget.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Input bind:value={expenseDescription} placeholder="Description" class="flex-1" />
					<Input bind:value={expenseAmount} type="number" placeholder="Amount" class="w-32" />
					<Button onclick={addExpense}>
						<PlusCircle class="mr-2 h-4 w-4" />
						Add Expense
					</Button>
				</div>
			</Card>
		</section>

		<!-- Budgets List -->
		<div class="grid gap-4 md:grid-cols-2">
			{#each $budgetStore as budget}
				<Card id="budget-{budget.id}" class="p-6 transition-all hover:shadow-md">
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-lg font-semibold">{budget.name}</h3>
						<div class="flex gap-2">
							<Button variant="ghost" size="icon" onclick={() => openEditDialog(budget)}>
								<Pencil class="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => budgetStore.deleteBudget(budget.id)}
							>
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
	</div>
</div>

<!-- Add this floating button after your main container -->
<FloatingBtn {isSticky} />

<!-- Add this dialog component after your main container -->
<Dialog.Root open={!!editingBudget} onOpenChange={(open) => !open && (editingBudget = null)}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Budget</Dialog.Title>
			<Dialog.Description>
				Make changes to your budget here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Input bind:value={editBudgetName} placeholder="Budget Name" />
			<Input bind:value={editBudgetAmount} type="number" placeholder="Amount" />
			<Select.Root type="single" bind:value={editBudgetCurrency}>
				<Select.Trigger class="w-full">{editBudgetCurrency}</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.GroupHeading>Currency</Select.GroupHeading>
						{#each currencies as currency}
							<Select.Item value={currency.value}>{currency.label}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (editingBudget = null)}>Cancel</Button>
			<Button onclick={updateBudget}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Add this after your BudgetDialog component -->

<Dialog.Root open={!!editingExpense} onOpenChange={(open) => !open && (editingExpense = null)}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Expense</Dialog.Title>
			<Dialog.Description>
				Make changes to the expense here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Input bind:value={editExpenseDescription} placeholder="Description" />
			<Input bind:value={editExpenseAmount} type="number" placeholder="Amount" />
		</div>
		<Dialog.Footer>
			<Button onclick={() => (editingExpense = null)} variant="outline">Cancel</Button>
			<Button onclick={updateExpense}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
