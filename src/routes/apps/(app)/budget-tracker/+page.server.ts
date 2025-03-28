// src/routes/apps/(app)/budget-tracker/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';

// Load function to fetch budgets and expenses
export const load = (async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		// Return an empty budgets array for unauthenticated users
		return {
			budgets: []
		};
	}

	try {
		const budgets = await prisma.budget.findMany({
			where: {
				userId: userId // Only fetch budgets for the current user
			},
			include: {
				expenses: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		// Return budgets (even if it's an empty array)
		return {
			budgets
		};
	} catch (err) {
		console.error('Error fetching budgets:', err);
		throw error(500, 'Failed to load budgets');
	}
}) satisfies PageServerLoad;

// Actions for form submissions
export const actions = {
	// Create a new budget
	createBudget: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return { success: false, error: 'Authentication required' };
		}
		const data = await request.formData();
		const name = data.get('name')?.toString();
		const amount = parseFloat(data.get('amount')?.toString() || '0');
		const currency = data.get('currency')?.toString();

		// Validate inputs
		if (!name || isNaN(amount) || amount <= 0 || !currency) {
			return { success: false, error: 'Invalid budget data' };
		}

		try {
			const budget = await prisma.budget.create({
				data: {
					name,
					amount,
					currency,
					userId: locals.user.id // Store the user ID with the budget
				}
			});

			return { success: true, budget };
		} catch (err) {
			console.error('Error creating budget:', err);
			return { success: false, error: 'Failed to create budget' };
		}
	},

	// Update an existing budget
	updateBudget: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return { success: false, error: 'Authentication required' };
		}
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const name = data.get('name')?.toString();
		const amount = parseFloat(data.get('amount')?.toString() || '0');
		const currency = data.get('currency')?.toString();

		if (!id || !name || isNaN(amount) || amount <= 0 || !currency) {
			return { success: false, error: 'Invalid budget data' };
		}

		try {
			const existingBudget = await prisma.budget.findUnique({
				where: { id }
			});
			if (!existingBudget || existingBudget.userId !== locals.user.id) {
				return { success: false, error: 'Budget not found or access denied' };
			}

			const budget = await prisma.budget.update({
				where: { id },
				data: { name, amount, currency }
			});

			return { success: true, budget };
		} catch (err) {
			console.error('Error updating budget:', err);
			return { success: false, error: 'Failed to update budget' };
		}
	},

	// Delete a budget
	deleteBudget: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return { success: false, error: 'Authentication required' };
		}
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, error: 'Budget ID is required' };
		}

		try {
			const existingBudget = await prisma.budget.findUnique({
				where: { id }
			});
			if (!existingBudget || existingBudget.userId !== locals.user.id) {
				return { success: false, error: 'Budget not found or access denied' };
			}

			await prisma.budget.delete({
				where: { id }
			});

			return { success: true };
		} catch (err) {
			console.error('Error deleting budget:', err);
			return { success: false, error: 'Failed to delete budget' };
		}
	},

	// Create a new expense
	createExpense: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return { success: false, error: 'Authentication required' };
		}
		const data = await request.formData();
		const budgetId = data.get('budgetId')?.toString();
		const description = data.get('description')?.toString();
		const amount = parseFloat(data.get('amount')?.toString() || '0');

		if (!budgetId || !description || isNaN(amount) || amount <= 0) {
			return { success: false, error: 'Invalid expense data' };
		}

		try {
			const budget = await prisma.budget.findUnique({
				where: { id: budgetId }
			});
			if (!budget || budget.userId !== locals.user.id) {
				return { success: false, error: 'Budget not found or access denied' };
			}

			const expense = await prisma.expense.create({
				data: {
					description,
					amount,
					budgetId
				}
			});

			return { success: true, expense };
		} catch (err) {
			console.error('Error creating expense:', err);
			return { success: false, error: 'Failed to create expense' };
		}
	},

	// Update an existing expense
	updateExpense: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return { success: false, error: 'Authentication required' };
		}
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const budgetId = data.get('budgetId')?.toString();
		const description = data.get('description')?.toString();
		const amount = parseFloat(data.get('amount')?.toString() || '0');

		if (!id || !budgetId || !description || isNaN(amount) || amount <= 0) {
			return { success: false, error: 'Invalid expense data' };
		}

		try {
			const expense = await prisma.expense.findUnique({
				where: { id },
				include: { budget: true }
			});
			if (!expense || expense.budget.userId !== locals.user.id) {
				return { success: false, error: 'Expense not found or access denied' };
			}

			const updatedExpense = await prisma.expense.update({
				where: { id },
				data: {
					description,
					amount,
					budgetId
				}
			});

			return { success: true, expense: updatedExpense };
		} catch (err) {
			console.error('Error updating expense:', err);
			return { success: false, error: 'Failed to update expense' };
		}
	},

	// Delete an expense
	deleteExpense: async ({ request, locals }) => {
		if (!locals.user?.id) {
			return { success: false, error: 'Authentication required' };
		}
		const data = await request.formData();
		const id = data.get('id')?.toString();

		if (!id) {
			return { success: false, error: 'Expense ID is required' };
		}

		try {
			const expense = await prisma.expense.findUnique({
				where: { id },
				include: { budget: true }
			});
			if (!expense || expense.budget.userId !== locals.user.id) {
				return { success: false, error: 'Expense not found or access denied' };
			}

			await prisma.expense.delete({
				where: { id }
			});

			return { success: true };
		} catch (err) {
			console.error('Error deleting expense:', err);
			return { success: false, error: 'Failed to delete expense' };
		}
	}
} satisfies Actions;
