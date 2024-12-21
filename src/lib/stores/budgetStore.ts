// src/lib/stores/budgetStore.ts
import { writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

// src/lib/types/budget.ts
export interface Budget {
	id: string;
	name: string;
	amount: number;
	expenses: Expense[];
	currency: string;
	createdAt: string;
}

export interface Expense {
	id: string;
	description: string;
	amount: number;
	createdAt: string;
}

function createBudgetStore() {
	const { subscribe, set, update } = persisted<Budget[]>('budgets', []);

	return {
		subscribe,
		addBudget: (name: string, amount: number, currency: string) => {
			const newBudget: Budget = {
				id: crypto.randomUUID(),
				name,
				amount,
				currency,
				expenses: [],
				createdAt: new Date().toISOString()
			};

			update((budgets) => {
				const updated = [...budgets, newBudget];
				localStorage.setItem('budgets', JSON.stringify(updated));
				return updated;
			});
		},
		updateBudget: (id: string, name: string, amount: number, currency: string) => {
			update((budgets) => {
				const index = budgets.findIndex((b) => b.id === id);
				if (index !== -1) {
					budgets[index] = { ...budgets[index], name, amount, currency };
				}
				const updated = [...budgets]; // Create new array to maintain immutability
				localStorage.setItem('budgets', JSON.stringify(updated));
				return updated;
			});
		},
		updateExpense: (budgetId: string, expenseId: string, description: string, amount: number) => {
			update((budgets) => {
				// Create a new array to maintain immutability
				const updatedBudgets = budgets.map((budget) => {
					if (budget.id === budgetId) {
						// Create new budget object with updated expenses
						return {
							...budget,
							expenses: budget.expenses.map((expense) => {
								if (expense.id === expenseId) {
									// Create new expense object with updated values
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

				// Update localStorage with new state
				localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
				return updatedBudgets;
			});
		},
		addExpense: (budgetId: string, description: string, amount: number) => {
			const newExpense: Expense = {
				id: crypto.randomUUID(),
				description,
				amount,
				createdAt: new Date().toISOString()
			};

			update((budgets) => {
				const updated = budgets.map((budget) =>
					budget.id === budgetId
						? { ...budget, expenses: [...budget.expenses, newExpense] }
						: budget
				);
				localStorage.setItem('budgets', JSON.stringify(updated));
				return updated;
			});
		},
		loadBudgets: () => {
			const stored = localStorage.getItem('budgets');
			if (stored) {
				set(JSON.parse(stored));
			}
		},
		deleteBudget: (id: string) => {
			update((budgets) => {
				const updated = budgets.filter((b) => b.id !== id);
				localStorage.setItem('budgets', JSON.stringify(updated));
				return updated;
			});
		},
		deleteExpense: (budgetId: string, expenseId: string) => {
			update((budgets) => {
				const updated = budgets.map((budget) =>
					budget.id === budgetId
						? { ...budget, expenses: budget.expenses.filter((e) => e.id !== expenseId) }
						: budget
				);
				localStorage.setItem('budgets', JSON.stringify(updated));
				return updated;
			});
		}
	};
}

export const budgetStore = createBudgetStore();
