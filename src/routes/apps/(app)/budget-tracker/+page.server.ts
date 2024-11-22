// import type { Actions, PageServerLoad } from './$types';
// import { fail } from '@sveltejs/kit';
// import { db } from '$lib/database';
// import type { Budget, Expense } from '$lib/utils';

// function mergeBudgets(frontendBudgets: Budget[], dbBudgets: Budget[]): Budget[] {
// 	// Create a map of existing budgets by name for faster lookup
// 	const dbBudgetMap = new Map(dbBudgets.map((budget) => [budget.name, budget]));
// 	const mergedBudgets: Budget[] = [];
// 	const processedBudgetNames = new Set<string>();

// 	// Process frontend budgets first
// 	for (const frontendBudget of frontendBudgets) {
// 		const dbBudget = dbBudgetMap.get(frontendBudget.name);
// 		processedBudgetNames.add(frontendBudget.name);

// 		if (!dbBudget) {
// 			// If budget doesn't exist in DB, add frontend budget as is
// 			mergedBudgets.push({ ...frontendBudget });
// 			continue;
// 		}

// 		// Create a map of existing expenses by name for faster lookup
// 		const dbExpenseMap = new Map(dbBudget.expenses.map((expense) => [expense.name, expense]));
// 		const mergedExpenses: Expense[] = [];
// 		const processedExpenseNames = new Set<string>();

// 		// Add frontend expenses first
// 		for (const frontendExpense of frontendBudget.expenses) {
// 			processedExpenseNames.add(frontendExpense.name);
// 			mergedExpenses.push({ ...frontendExpense });
// 		}

// 		// Add DB expenses that don't exist in frontend
// 		for (const dbExpense of dbBudget.expenses) {
// 			if (!processedExpenseNames.has(dbExpense.name)) {
// 				mergedExpenses.push({ ...dbExpense });
// 			}
// 		}

// 		// Add merged budget
// 		mergedBudgets.push({
// 			name: frontendBudget.name,
// 			amount: frontendBudget.amount,
// 			expenses: mergedExpenses
// 		});
// 	}

// 	// Add remaining DB budgets that don't exist in frontend
// 	for (const dbBudget of dbBudgets) {
// 		if (!processedBudgetNames.has(dbBudget.name)) {
// 			mergedBudgets.push({ ...dbBudget });
// 		}
// 	}

// 	return mergedBudgets;
// }

// export const actions: Actions = {
// 	syncBudgets: async ({ request }) => {
// 		try {
// 			// Parse the budgets from the form data
// 			const data = await request.formData();
// 			const budgets = data.get('budgets') as string;
// 			const parsedBudgets = JSON.parse(budgets) as Budget[];
// 			const userId = data.get('userId') as string;

// 			if (!userId) {
// 				return fail(400, { message: 'User ID is required' });
// 			}

// 			// Get existing budgets from the database
// 			const existingBudgets = await db.userBudgets.findUnique({
// 				where: { userId }
// 			});

// 			// Merge budgets if there are existing ones
// 			let mergedBudgets = parsedBudgets;
// 			if (existingBudgets?.budgetData) {
// 				try {
// 					const dbBudgets = JSON.parse(existingBudgets.budgetData) as Budget[];
// 					mergedBudgets = mergeBudgets(parsedBudgets, dbBudgets);
// 				} catch (error) {
// 					console.error('Error merging budgets:', error);
// 					return fail(500, { message: 'Failed to merge budgets' });
// 				}
// 			}

// 			// Update the database with merged budgets
// 			const userBudgets = await db.userBudgets.upsert({
// 				where: { userId },
// 				create: {
// 					userId,
// 					budgetData: JSON.stringify(mergedBudgets)
// 				},
// 				update: {
// 					budgetData: JSON.stringify(mergedBudgets)
// 				}
// 			});

// 			if (!userBudgets) {
// 				return fail(500, { message: 'Failed to update budgets' });
// 			}

// 			// Return the merged budgets
// 			return {
// 				data: mergedBudgets
// 			};
// 		} catch (error) {
// 			console.error('Error syncing budgets:', error);
// 			return fail(500, { message: 'Failed to sync budgets' });
// 		}
// 	}
// };

