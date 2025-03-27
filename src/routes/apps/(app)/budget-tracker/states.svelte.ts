import { PersistedState } from 'runed';

// Types
export interface Expense {
	id: string;
	description: string;
	amount: number;
	createdAt: string;
}

export interface Budget {
	id: string;
	name: string;
	amount: number;
	expenses: Expense[];
	currency: string;
	createdAt: string;
}

// Create a persisted state for budgets with cross-tab synchronization
const budgetState = new PersistedState<Budget[]>('budgets', [], {
	storage: 'local', // Use localStorage
	syncTabs: true // Sync across tabs
});

// Budget store functions
export function addBudget(name: string, amount: number, currency: string) {
	const newBudget: Budget = {
		id: crypto.randomUUID(),
		name,
		amount,
		currency,
		expenses: [],
		createdAt: new Date().toISOString()
	};

	// Update the persisted state
	budgetState.current = [...budgetState.current, newBudget];
}

export function updateBudget(id: string, name: string, amount: number, currency: string) {
	const updatedBudgets = budgetState.current.map((budget) =>
		budget.id === id ? { ...budget, name, amount, currency } : budget
	);

	// Update the persisted state
	budgetState.current = updatedBudgets;
}

export function addExpense(budgetId: string, description: string, amount: number) {
	const newExpense: Expense = {
		id: crypto.randomUUID(),
		description,
		amount,
		createdAt: new Date().toISOString()
	};

	const updatedBudgets = budgetState.current.map((budget) =>
		budget.id === budgetId ? { ...budget, expenses: [...budget.expenses, newExpense] } : budget
	);

	// Update the persisted state
	budgetState.current = updatedBudgets;
}

export function updateExpense(
	budgetId: string,
	expenseId: string,
	description: string,
	amount: number
) {
	const updatedBudgets = budgetState.current.map((budget) => {
		if (budget.id === budgetId) {
			return {
				...budget,
				expenses: budget.expenses.map((expense) => {
					if (expense.id === expenseId) {
						return {
							...expense,
							description,
							amount,
							createdAt: new Date().toISOString()
						};
					}
					return expense;
				})
			};
		}
		return budget;
	});

	// Update the persisted state
	budgetState.current = updatedBudgets;
}

export function deleteBudget(id: string) {
	budgetState.current = budgetState.current.filter((budget) => budget.id !== id);
}

export function deleteExpense(budgetId: string, expenseId: string) {
	const updatedBudgets = budgetState.current.map((budget) =>
		budget.id === budgetId
			? { ...budget, expenses: budget.expenses.filter((e) => e.id !== expenseId) }
			: budget
	);

	// Update the persisted state
	budgetState.current = updatedBudgets;
}

// Export the budget state as a readable store
export const budgets = {
	subscribe: (callback: (value: Budget[]) => void) => {
		// Initial call with current value
		callback(budgetState.current);

		// Set up an effect to call the callback whenever budgetState.current changes
		const unsubscribe = $effect.root(() => {
			$effect(() => {
				// This will re-run whenever budgetState.current changes
				callback(budgetState.current);
			});

			// Handle cross-tab synchronization with the storage event
			const storageHandler = () => {
				callback(budgetState.current);
			};

			window.addEventListener('storage', storageHandler);

			// Return cleanup function
			return () => {
				window.removeEventListener('storage', storageHandler);
			};
		});

		// Return unsubscribe function
		return unsubscribe;
	},
	get current() {
		return budgetState.current;
	}
};

/**
 * Helper function to find a budget by ID
 * @param id Budget ID to find
 * @returns Budget object if found, undefined otherwise
 */
export function findBudget(id: string): Budget | undefined {
	return budgetState.current.find((budget) => budget.id === id);
}

/**
 * Helper function to get all expenses for a specific budget
 * @param budgetId Budget ID to get expenses for
 * @returns Array of expenses for the budget
 */
export function getBudgetExpenses(budgetId: string): Expense[] {
	const budget = findBudget(budgetId);
	return budget ? budget.expenses : [];
}

/**
 * Helper function to get all expenses across all budgets
 * @returns Array of all expenses with budget information
 */
export function getAllExpenses(): Array<{
	budgetId: string;
	budgetName: string;
	expense: Expense;
}> {
	return budgetState.current.flatMap((budget) =>
		budget.expenses.map((expense) => ({
			budgetId: budget.id,
			budgetName: budget.name,
			expense
		}))
	);
}

/**
 * Helper function to get total expenses for all budgets
 * @returns Total amount of all expenses
 */
export function getTotalExpenses(): number {
	return budgetState.current.reduce(
		(total, budget) =>
			total + budget.expenses.reduce((budgetTotal, expense) => budgetTotal + expense.amount, 0),
		0
	);
}
