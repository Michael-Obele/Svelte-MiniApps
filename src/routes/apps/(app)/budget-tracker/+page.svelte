<script lang="ts">
	import BudgetsList from './BudgetsList.svelte';
	import FloatingBtn from './FloatingBtn.svelte';
	import BudgetDialog from './BudgetDialog.svelte';
	import QuickNavigation from './QuickNavigation.svelte';
	import { budgetStore, type Budget, type Expense } from '$lib/stores/budgetStore';
	import { toast } from 'svelte-sonner';
	import ExpenseDialog from './ExpenseDialog.svelte';
	import FormSection from './FormSection.svelte';
	import RouteHead from '@/RouteHead.svelte';

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
	let formsSection: HTMLElement | null = $state(null);

	// Add supported currencies
	const currencies = [
		{ value: 'USD', label: 'US Dollar ($)', symbol: '$' },
		{ value: 'EUR', label: 'Euro (€)', symbol: '€' },
		{ value: 'GBP', label: 'British Pound (£)', symbol: '£' },
		{ value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
		{ value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' }
	];

	let selectedCurrency = $state('USD');

	// Observe the forms section to determine if it is sticky
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

	// Format a figure by removing commas and dots
	const formatFigure = (value: string) => {
		return Number(value.replace(/,|\./g, ''));
	};

	// Add a new budget
	function addBudget() {
		if (!budgetName || budgetAmount === undefined || budgetAmount === '' || !selectedCurrency) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetStore.addBudget(budgetName, formatFigure(budgetAmount), selectedCurrency);
		toast.success('Budget added successfully');
		budgetName = '';
		budgetAmount = '';
		selectedCurrency = 'USD';
	}

	// Add a new expense
	function addExpense() {
		if (!selectedBudgetId || !expenseDescription || !expenseAmount) {
			toast.error('Please fill in all fields');
			return;
		}

		budgetStore.addExpense(selectedBudgetId, expenseDescription, formatFigure(expenseAmount));
		toast.success('Expense added successfully');
		expenseDescription = '';
		expenseAmount = '';
		selectedBudgetId = '';
		selectedBudgetName = 'Select Budget'; // Reset the name
	}

	// Format a currency amount
	function formatCurrency(amount: number, currency: string): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency
		}).format(amount);
	}

	// Calculate the total expenses for a budget
	function calculateTotalExpenses(expenses: Expense[]): number {
		return expenses.reduce((total, expense) => total + expense.amount, 0);
	}

	// Update an existing expense
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

	// Get the progress percentage for a budget
	function getProgressPercentage(budget: Budget): number {
		const spent = calculateTotalExpenses(budget.expenses ?? []);
		return Math.min((spent / budget.amount) * 100, 100);
	}

	// Get the color for the progress bar based on the percentage
	function getProgressBarColor(percentage: number): string {
		if (percentage >= 90) return 'bg-destructive dark:bg-destructive';
		if (percentage > 50) return 'bg-yellow-500 dark:bg-yellow-500';
		if (percentage <= 50) return 'bg-emerald-500 dark:bg-emerald-500';
		return '';
	}

	// Open the edit expense dialog
	function openEditExpenseDialog(budgetId: string, expense: Expense) {
		editingExpense = { budgetId, expense };
		editExpenseDescription = expense.description;
		editExpenseAmount = String(expense.amount);
	}

	// Add these state variables for editing budgets
	let editingBudget = $state<Budget | null>(null);
	let editBudgetName = $state('');
	let editBudgetAmount = $state('');
	let editBudgetCurrency = $state('');

	// Update an existing budget
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

		budgetStore.updateBudget(
			editingBudget.id,
			editBudgetName,
			Number(editBudgetAmount),
			editBudgetCurrency
		);
		toast.success('Budget updated successfully');
		editingBudget = null;
	}

	// Open the edit budget dialog
	function openEditDialog(budget: Budget) {
		editingBudget = budget;
		editBudgetName = budget.name;
		editBudgetAmount = String(budget.amount);
		editBudgetCurrency = budget.currency;
	}

	// Format a number with commas
	function formatNumberWithCommas(value: string | number): string {
		return Number(value).toLocaleString();
	}

	// Format the input number with proper thousand separators
	function formatNumberInput(e: Event) {
		const target = e.target as HTMLInputElement;

		// First, remove any non-numeric characters except dots and commas
		let value = target.value.replace(/[^\d.,]/g, '');

		// Replace multiple dots with a single dot and ensure only one decimal point
		value = value.replace(/\.+/g, '.');
		const parts = value.split('.');
		if (parts.length > 2) {
			value = parts[0] + '.' + parts.slice(1).join('');
		}

		// Remove commas and format with proper thousand separators
		value = value.replace(/,/g, '');
		if (value) {
			const [integerPart, decimalPart] = value.split('.');
			// Format integer part with thousand separators
			let formattedInteger = Number(integerPart).toLocaleString('en-US');

			// Add back decimal part if it exists
			value = decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
		}

		// Update the input value
		target.value = value;
	}

	// Get the currency symbol for a given currency code
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

	// Format a number with commas
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

		<!-- Quick Navigation -->
		{#if $budgetStore.length > 0}
			<QuickNavigation {getProgressBarColor} />
		{/if}

		<!-- Forms Section -->
		<FormSection
			bind:budgetName
			bind:budgetAmount
			bind:selectedBudgetId
			bind:selectedBudgetName
			bind:expenseDescription
			bind:expenseAmount
			bind:selectedCurrency
			bind:formsSection
			{currencies}
			{addBudget}
			{addExpense}
			{formatNumberInput}
		/>

		<!-- Budgets List -->
		<BudgetsList
			{openEditDialog}
			{openEditExpenseDialog}
			{getProgressPercentage}
			{getProgressBarColor}
			{getCurrencySymbol}
			{formatNumberWithCommas}
			{calculateTotalExpenses}
		/>
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
