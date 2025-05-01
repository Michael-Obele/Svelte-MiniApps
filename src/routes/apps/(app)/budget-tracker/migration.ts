import { toast } from 'svelte-sonner';
import * as budgetState from './states.svelte';
import type { Budget } from './states.svelte';

export type MigrationResult =
	| { success: true; migrated: number }
	| { success: false; error: string };

/**
 * Migrates local budget data from localStorage to the server
 * @returns Promise with migration result
 */
export async function migrateLocalDataToServer(): Promise<MigrationResult> {
	try {
		// Get budgets from the budgets store's current property
		const localBudgets = budgetState.budgets.current;

		if (localBudgets.length === 0) {
			// Don't show toast here, let the caller handle it
			return { success: true, migrated: 0 };
		}

		// Create a FormData object instead of sending JSON
		const formData = new FormData();
		formData.append('budgets', JSON.stringify(localBudgets));

		// Send to server using SvelteKit form action with form-encoded data
		const response = await fetch('?/backupToServer', {
			method: 'POST',
			body: formData
		});

		const result = await response.json();
		console.log('Migration result:', result);

		// If successful, mark as migrated in localStorage
		if (result.success) {
			localStorage.setItem('budgets_migrated', 'true');
			// Don't show toast here, let the caller handle it
			return { success: true, migrated: result.migrated };
		} else {
			// Don't show toast here, let the caller handle it
			return { success: false, error: result.error };
		}
	} catch (error) {
		console.error('Migration error:', error);
		// Don't show toast here, let the caller handle it
		return { success: false, error: String(error) };
	}
}

/**
 * Checks if local data has been migrated to the server
 * @returns boolean indicating if data has been migrated
 */
export function isDataMigrated(): boolean {
	return localStorage.getItem('budgets_migrated') === 'true';
}

/**
 * Loads budgets from the server and updates local state
 * @returns Promise with loaded budgets
 */
export async function loadBudgetsFromServer(): Promise<Budget[]> {
	try {
		// Use the SvelteKit form action to load budgets
		const response = await fetch('?/loadBudgets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});

		if (!response.ok) {
			throw new Error(`Server returned ${response.status}: ${response.statusText}`);
		}

		const result = await response.json();
		console.log('Server load result:', result);

		if (!result.success) {
			// Don't show toast here, let the caller handle it
			return [];
		}

		const serverBudgets = result.budgets || [];
		console.log('📊 Received budgets from server:', serverBudgets);

		// Only update local state if we have server budgets
		if (Array.isArray(serverBudgets) && serverBudgets.length > 0) {
			// Replace the current budgets with the server budgets
			// First clear existing budgets
			const currentBudgets = budgetState.budgets.current;
			currentBudgets.forEach((budget) => {
				budgetState.deleteBudget(budget.id);
			});

			// Track processed budget IDs to prevent duplicates
			const processedBudgetIds = new Set<string>();

			// Then add each server budget
			serverBudgets.forEach((serverBudget: any) => {
				// Skip if we've already processed this budget ID
				if (processedBudgetIds.has(serverBudget.id)) {
					console.log(`⚠️ Skipping duplicate budget: ${serverBudget.id}`);
					return;
				}

				// Convert Prisma budget to local Budget type
				const budget = {
					id: serverBudget.id,
					name: serverBudget.name,
					amount: serverBudget.amount,
					currency: serverBudget.currency,
					createdAt: serverBudget.createdAt.toISOString(),
					expenses: []
				};

				// Add budget to state with its existing ID
				budgetState.addBudget(budget.name, budget.amount, budget.currency, budget.id);
				processedBudgetIds.add(budget.id);

				// Add expenses if any, ensuring we don't add duplicates
				if (serverBudget.expenses && serverBudget.expenses.length > 0) {
					// Track processed expense IDs to prevent duplicates
					const processedExpenseIds = new Set<string>();

					serverBudget.expenses.forEach((serverExpense: any) => {
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
						processedExpenseIds.add(expense.id);
					});
				}
			});

			// Mark as migrated since we loaded from server
			localStorage.setItem('budgets_migrated', 'true');

			// Don't show toast here, let the caller handle it
		} else {
			// Don't show toast here, let the caller handle it
		}

		return serverBudgets;
	} catch (error) {
		console.error('Error loading budgets from server:', error);
		// Don't show toast here, let the caller handle it
		return [];
	}
}
