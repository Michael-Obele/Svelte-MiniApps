<script lang="ts">
	import BudgetsList from './BudgetsList.svelte';
	import FloatingBtn from './FloatingBtn.svelte';
	import BudgetDialog from './BudgetDialog.svelte';
	import QuickNavigation from './QuickNavigation.svelte';
	import { budgetStore, type Budget, type Expense } from '$lib/stores/budgetStore';
	import { toast } from 'svelte-sonner';
	import ExpenseDialog from './ExpenseDialog.svelte';
	import FormSection from './FormSection.svelte';

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
		if (!budgetName || budgetAmount === undefined || budgetAmount === '' || !selectedCurrency) {
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
		if (percentage > 50) return 'bg-yellow-500 dark:bg-yellow-500';
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

	//Function to open edit dialog
	function openEditDialog(budget: Budget) {
		editingBudget = budget;
		editBudgetName = budget.name;
		editBudgetAmount = String(budget.amount);
		editBudgetCurrency = budget.currency;
	}

	// Function to format numbers with commas
	function formatNumberWithCommas(value: string | number): string {
		return Number(value).toLocaleString();
	}

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

	// Add this helper function at the top of your script section
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
</script>

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
			{currencies}
			{addBudget}
			{addExpense}
			{formsSection}
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

<FloatingBtn {isSticky} />

<BudgetDialog
	bind:editingBudget
	bind:editBudgetName
	bind:editBudgetAmount
	bind:editBudgetCurrency
	{updateBudget}
	{currencies}
/>

<ExpenseDialog
	bind:editingExpense
	bind:editExpenseDescription
	bind:editExpenseAmount
	{updateExpense}
/>
