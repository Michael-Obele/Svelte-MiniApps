<script lang="ts">
	// Import migration utilities
	import { migrateLocalDataToServer, isDataMigrated, loadBudgetsFromServer } from './migration';
	import { onMount, onDestroy } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { Loader2 } from 'lucide-svelte';

	import BudgetsList from './BudgetsList.svelte';
	import FloatingBtn from './FloatingBtn.svelte';
	import BudgetDialog from './BudgetDialog.svelte';
	import QuickNavigation from './QuickNavigation.svelte';
	import type { Budget, Expense } from './states.svelte';
	import * as budgetState from './states.svelte';
	import ExpenseDialog from './ExpenseDialog.svelte';
	import BudgetSection from './BudgetSection.svelte';
	import ExpenseSection from './ExpenseSection.svelte';
	import ExpensesList from './ExpensesList.svelte';
	import RouteHead from '@/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { scrollToID } from '$lib/utils';
	import * as AlertDialog from '@/ui/alert-dialog';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	// Reactive store reference for budgets
	// let budgets = $state<Budget[]>([]);

	// Subscribe to the budget state
	// let unsubscribe: () => void;
	// $effect.root(() => {
	// 	unsubscribe = budgetState.budgets.subscribe((value) => {
	// 		budgets = value;
	// 	});

	// 	return () => {
	// 		if (unsubscribe) unsubscribe();
	// 	};
	// });

	console.log('Budget Tracker component initialized', budgetState.budgets.current);

	let budgetName = $state('');
	let budgetAmount: number | undefined = $state(undefined);
	let selectedBudgetId = $state('');
	let selectedBudgetName = $state('Select Budget');
	let expenseDescription = $state('');
	let expenseAmount: number | undefined = $state(undefined);
	let editingExpense = $state<{ budgetId: string; expense: Expense } | null>(null);
	let editExpenseDescription = $state('');
	let editExpenseAmount = $state('');

	let hasUnsavedChanges = $state(false);

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

	// Check if data has been migrated to server on mount
	let isMigrated = $state(false);
	let isBackingUp = $state(false);
	let isLoading = $state(false);

	// Get data from the page load
	let { data, form } = $props();

	// Check if user is authenticated
	let isAuthenticated = $state(!!data.user);

	$effect(() => {
		// Update authentication status when data changes
		isAuthenticated = !!data.user;
	});

	onMount(() => {
		// Check if data has been migrated to server
		isMigrated = isDataMigrated();

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				event.preventDefault();
				event.returnValue = ''; // Required for Chrome
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		beforeNavigate(({ cancel }) => {
			if (hasUnsavedChanges) {
				const confirmNavigation = window.confirm(
					'You have unsaved changes. Do you want to leave without saving?'
				);
				if (!confirmNavigation) {
					cancel();
				} else {
					hasUnsavedChanges = false; // User chose to discard changes
				}
			}
		});

		onDestroy(() => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		});

		// If we have server budgets, initialize them
		if (data.budgets && Array.isArray(data.budgets) && data.budgets.length > 0) {
			console.log('📊 Initializing budgets from server data:', data.budgets);
			// Clear existing budgets first
			const currentBudgets = budgetState.budgets.current;
			currentBudgets.forEach((budget) => {
				budgetState.deleteBudget(budget.id);
			});

			// Then add each server budget - convert Prisma types to local state types
			data.budgets.forEach((serverBudget: any) => {
				// Convert Prisma budget to local Budget type
				const budget: Budget = {
					id: serverBudget.id,
					name: serverBudget.name,
					amount: serverBudget.amount,
					currency: serverBudget.currency,
					createdAt: serverBudget.createdAt.toISOString(),
					expenses: []
				};

				// Add budget to state with its existing ID
				budgetState.addBudget(budget.name, budget.amount, budget.currency, budget.id);

				// Add expenses if any, ensuring we don't add duplicates
				if (serverBudget.expenses && serverBudget.expenses.length > 0) {
					// Track processed expense IDs to prevent duplicates
					const processedExpenseIds = new Set<string>();

					serverBudget.expenses.forEach(
						(serverExpense: {
							id: string;
							description: string;
							amount: number;
							createdAt: Date;
						}) => {
							// Skip if we've already processed this expense ID
							if (processedExpenseIds.has(serverExpense.id)) {
								console.log(`⚠️ Skipping duplicate expense: ${serverExpense.id}`);
								return;
							}

							// Convert Prisma expense to local Expense type
							const expense = {
								id: serverExpense.id,
								description: serverExpense.description,
								amount: serverExpense.amount,
								createdAt: serverExpense.createdAt.toISOString()
							};

							// Add to state with existing ID
							budgetState.addExpense(budget.id, expense.description, expense.amount, expense.id);

							// Mark as processed
							processedExpenseIds.add(serverExpense.id);
						}
					);
				}
			});

			// Mark as migrated since we loaded from server
			localStorage.setItem('budgets_migrated', 'true');
			isMigrated = true;
			hasUnsavedChanges = false; // Reset unsaved changes after loading from server
		}
	});

	let alertOpen = $state(false);
	let alertTitle = $state('');
	let alertDescription = $state('');

	$effect(() => {
		if (form && typeof form.success !== 'undefined') {
			if ('migrated' in form) {
				alertTitle = form.success ? 'Backup Successful' : 'Backup Failed';
				alertDescription = form.success
					? `Successfully backed up ${form.migrated ?? 0} budgets to server.`
					: form.error || 'Unknown error during backup.';
				alertOpen = true;
				if (form.success) {
					hasUnsavedChanges = false; // Reset unsaved changes after successful backup
				}
			} else if ('budgets' in form) {
				alertTitle = form.success ? 'Load Successful' : 'Load Failed';
				alertDescription = form.success
					? `Loaded ${form.budgets?.length} budgets from server.`
					: form.error || 'Unknown error during load.';
				alertOpen = true;
				if (form.success) {
					hasUnsavedChanges = false; // Reset unsaved changes after successful load
				}
			}
		}
	});

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
		// Accept 0 as valid for budgetAmount
		if (!budgetName || budgetAmount === undefined || budgetAmount === null || !selectedCurrency) {
			toast.error('Please fill in all fields');
			return;
		}
		budgetState.addBudget(budgetName, budgetAmount, selectedCurrency);
		toast.success('Budget added successfully');
		budgetName = '';
		budgetAmount = undefined;
		selectedCurrency = 'USD';
		hasUnsavedChanges = true; // Mark as unsaved changes
	}

	function addExpense() {
		// Accept 0 and negative numbers for expenseAmount
		if (
			!selectedBudgetId ||
			!expenseDescription ||
			expenseAmount === undefined ||
			expenseAmount === null
		) {
			toast.error('Please fill in all fields');
			return;
		}
		budgetState.addExpense(selectedBudgetId, expenseDescription, expenseAmount);
		toast.success('Expense added successfully');
		expenseDescription = '';
		expenseAmount = undefined;
		selectedBudgetId = '';
		selectedBudgetName = 'Select Budget';
		hasUnsavedChanges = true; // Mark as unsaved changes
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
		if (!editExpenseDescription || editExpenseAmount === undefined || editExpenseAmount === null) {
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
		hasUnsavedChanges = true; // Mark as unsaved changes
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
			editBudgetAmount === null ||
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
		hasUnsavedChanges = true; // Mark as unsaved changes
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
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold tracking-tight">Budget Tracker</h1>
			{#if isAuthenticated}
				<!-- Server Backup Controls -->
				<div class="flex flex-col gap-2 sm:flex-row">
					<form
						method="POST"
						action="?/backupToServer"
						use:enhance={() => {
							isBackingUp = true;
							isLoading = true;
							toast.loading('Backing up budgets...', {
								duration: Infinity,
								id: 'backup-toast'
							});
							return async ({ result }) => {
								isBackingUp = false;
								isLoading = false;
								if (result.type === 'success') {
									toast.success('Budgets backed up successfully!');
									toast.dismiss('backup-toast');
									hasUnsavedChanges = false;
								} else {
									toast.error('Failed to backup budgets.');
								}
							};
						}}
						class="w-full sm:w-auto"
					>
						<input
							type="hidden"
							name="budgets"
							value={JSON.stringify(budgetState.budgets.current)}
						/>
						<Button
							type="submit"
							disabled={isBackingUp || isLoading}
							class="w-full disabled:bg-opacity-20 {isBackingUp ? 'disabled:bg-transparent' : ''}"
							size="sm"
						>
							{#if isBackingUp}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Backing up...
							{:else}
								Backup to Server
							{/if}
						</Button>
					</form>
					<form
						method="POST"
						action="?/loadBudgets"
						use:enhance={() => {
							isLoading = true;
							isBackingUp = true;
							toast.loading('Loading budgets from server...', {
								duration: Infinity,
								id: 'load-toast'
							});
							// Load budgets from server and update state
							return async ({ result }) => {
								isLoading = false;
								isBackingUp = false;
								if (result.type === 'success') {
									toast.success('Budgets loaded successfully!');
									toast.dismiss('load-toast');
									hasUnsavedChanges = false;
								} else {
									toast.error('Failed to load budgets.');
								}
							};
						}}
						class="w-full sm:w-auto"
					>
						<Button
							type="submit"
							disabled={isLoading || isBackingUp}
							class="w-full {isLoading ? 'loading' : ''}"
							size="sm"
						>
							{#if isLoading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Loading...
							{:else}
								Load from Server
							{/if}
						</Button>
					</form>
				</div>
			{/if}
		</div>

		{#if budgetState.budgets.current.length > 0}
			<QuickNavigation {getProgressBarColor} />
		{/if}

		<BudgetSection
			bind:budgetName
			bind:budgetAmount
			bind:selectedCurrency
			bind:formsSection
			{currencies}
			{addBudget}
			{formatNumber}
			budgets={budgetState.budgets.current}
		/>

		<ExpenseSection
			bind:selectedBudgetId
			bind:selectedBudgetName
			bind:expenseDescription
			bind:expenseAmount
			budgets={budgetState.budgets.current}
			{addExpense}
			{formatNumber}
		/>

		<div class="grid gap-6">
			<!-- Empty state message when no budgets -->
			{#if budgetState.budgets.current.length === 0}
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
					budgets={budgetState.budgets.current}
				/>

				<!-- Add the new ExpensesList component -->
				<ExpensesList
					budgets={budgetState.budgets.current}
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

<AlertDialog.Root open={alertOpen} onOpenChange={(v) => (alertOpen = v)}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{alertTitle}</AlertDialog.Title>
			<AlertDialog.Description>{alertDescription}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>OK</AlertDialog.Cancel>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
