<script lang="ts">
	import BudgetsList from './BudgetsList.svelte';
	import FloatingBtn from './FloatingBtn.svelte';
	import BudgetDialog from './BudgetDialog.svelte';
	import QuickNavigation from './QuickNavigation.svelte';
	import type { Budget, Expense } from './states.svelte';
	import * as budgetState from './states.svelte';
	import { toast } from 'svelte-sonner';
	import ExpenseDialog from './ExpenseDialog.svelte';
	import BudgetSection from './BudgetSection.svelte';
	import ExpenseSection from './ExpenseSection.svelte';
	import ExpensesList from './ExpensesList.svelte';
	import RouteHead from '@/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { scrollToID } from '$lib/utils';

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

	let budgetName = $state('');
	let budgetAmount = $state('');
	let selectedBudgetId = $state('');
	let selectedBudgetName = $state('Select Budget');
	let expenseDescription = $state('');
	let expenseAmount = $state('');
	let editingExpense = $state<{ budgetId: string; expense: Expense } | null>(null);
	let editExpenseDescription = $state('');
	let editExpenseAmount = $state('');

	let isSticky = $state(false);
	let formsSection: HTMLElement | null = $state(null);

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

	const formatFigure = (value: string) => {
		return Number(value.replace(/,|\./g, ''));
	};

	function addBudget() {
		if (!budgetName || budgetAmount === undefined || budgetAmount === '' || !selectedCurrency) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetState.addBudget(budgetName, formatFigure(budgetAmount), selectedCurrency);
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

		budgetState.addExpense(selectedBudgetId, expenseDescription, formatFigure(expenseAmount));
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

		budgetState.updateExpense(
			editingExpense.budgetId,
			editingExpense.expense.id,
			editExpenseDescription,
			Number(editExpenseAmount)
		);
		toast.success('Expense updated successfully');
		editingExpense = null;
	}

	function getProgressPercentage(budget: Budget): number {
		const spent = calculateTotalExpenses(budget.expenses ?? []);
		return Math.min((spent / budget.amount) * 100, 100);
	}

	function getProgressBarColor(percentage: number): string {
		if (percentage >= 90) return 'bg-destructive dark:bg-destructive';
		if (percentage > 50) return 'bg-yellow-500 dark:bg-yellow-500';
		if (percentage <= 50) return 'bg-emerald-500 dark:bg-emerald-500';
		return '';
	}

	function openEditExpenseDialog(budgetId: string, expense: Expense) {
		editingExpense = { budgetId, expense };
		editExpenseDescription = expense.description;
		editExpenseAmount = String(expense.amount);
	}

	let editingBudget = $state<Budget | null>(null);
	let editBudgetName = $state('');
	let editBudgetAmount = $state('');
	let editBudgetCurrency = $state('');

	function updateBudget() {
		if (!editingBudget) {
			toast.error('No budget selected for editing');
			return;
		}

		if (
			!editBudgetName ||
			editBudgetAmount === undefined ||
			editBudgetAmount === '' ||
			!editBudgetCurrency
		) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetState.updateBudget(
			editingBudget.id,
			editBudgetName,
			Number(editBudgetAmount),
			editBudgetCurrency
		);
		toast.success('Budget updated successfully');
		editingBudget = null;
	}

	function openEditDialog(budget: Budget) {
		editingBudget = budget;
		editBudgetName = budget.name;
		editBudgetAmount = String(budget.amount);
		editBudgetCurrency = budget.currency;
	}

	function formatNumberWithCommas(value: string | number): string {
		return Number(value).toLocaleString();
	}

	function formatNumberInput(e: Event) {
		const target = e.target as HTMLInputElement;

		let value = target.value.replace(/[^\d.,]/g, '');

		value = value.replace(/\.+/g, '.');
		const parts = value.split('.');
		if (parts.length > 2) {
			value = parts[0] + '.' + parts.slice(1).join('');
		}

		value = value.replace(/,/g, '');
		if (value) {
			const [integerPart, decimalPart] = value.split('.');
			let formattedInteger = Number(integerPart).toLocaleString('en-US');

			value = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
		}

		target.value = value;
	}

	function getCurrencySymbol(currencyCode: string): string {
		const symbols: { [key: string]: string } = {
			USD: '$',
			EUR: '€',
			GBP: '£',
			JPY: '¥',
			NGN: '₦'
		};
		return symbols[currencyCode] || currencyCode;
	}

	function formatNumber(value: number) {
		return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
	}
</script>

<RouteHead
	title="Budget Tracker | Svelte MiniApps"
	description="Create and manage budgets, track expenses, and visualize your spending with our simple yet powerful budget tracking tool."
	keywords="budget tracker, expense tracker, personal finance, money management, financial planning, spending tracker"
	route="/apps/budget-tracker"
	type="website"
	structuredData={{
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'Budget Tracker',
		applicationCategory: 'FinanceApplication',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		featureList: 'Create budgets, Track expenses, Visualize spending, Multiple currency support',
		operatingSystem: 'Any'
	}}
/>

<div class="container mx-auto max-w-4xl space-y-8 p-4">
	<div class="space-y-4">
		<h1 class="text-3xl font-bold tracking-tight">Budget Tracker</h1>

		{#if budgets.length > 0}
			<QuickNavigation {getProgressBarColor} />
		{/if}

		<BudgetSection
			bind:budgetName
			bind:budgetAmount
			bind:selectedCurrency
			bind:formsSection
			{currencies}
			{addBudget}
			{formatNumberInput}
			{budgets}
		/>

		<ExpenseSection
			bind:selectedBudgetId
			bind:selectedBudgetName
			bind:expenseDescription
			bind:expenseAmount
			{budgets}
			{formatNumberInput}
		/>

		<div class="grid gap-6">
			<!-- Empty state message when no budgets -->
			{#if budgets.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center text-muted-foreground"
				>
					<h2 class="text-xl font-semibold">No Budgets Yet</h2>
					<p class="mb-6 mt-2 max-w-md text-sm">
						Create your first budget to get started tracking your expenses.
					</p>
					<Button onclick={() => scrollToID('budget-form')}>Create Budget</Button>
				</div>
			{:else}
				<BudgetsList
					{openEditDialog}
					{openEditExpenseDialog}
					{getProgressBarColor}
					{getProgressPercentage}
					{getCurrencySymbol}
					{formatNumberWithCommas}
					{calculateTotalExpenses}
					{budgets}
				/>

				<!-- Add the new ExpensesList component -->
				<ExpensesList
					{budgets}
					{openEditExpenseDialog}
					{getCurrencySymbol}
					{formatNumberWithCommas}
				/>
			{/if}
		</div>
	</div>
</div>

{#if isSticky}
	<FloatingBtn />
{/if}

<BudgetDialog
	bind:editingBudget
	bind:editBudgetName
	bind:editBudgetAmount
	bind:editBudgetCurrency
	{updateBudget}
	{formatNumber}
	{currencies}
/>

<ExpenseDialog
	bind:editingExpense
	bind:editExpenseDescription
	bind:editExpenseAmount
	{updateExpense}
	{formatNumber}
/>
