// src/routes/apps/(app)/budget-tracker/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/db';

// Load function to fetch budgets and expenses
export const load = (async ({ locals }) => {
	const userId = locals.user?.id;
	const user = locals.user;

	if (!userId) {
		// Return an empty budgets array for unauthenticated users
		console.log('❌ No user ID found in load function - returning empty budgets array');
		return {
			budgets: [],
			user: null
		};
	}

	try {
		console.log(`🔍 Loading budgets for user: ${userId}`);
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

		console.log(`📊 Found ${budgets.length} budgets for user ${userId}`);

		// Return budgets (even if it's an empty array)
		return {
			budgets,
			user
		};
	} catch (err) {
		console.error('Error fetching budgets:', err);
		throw error(500, 'Failed to load budgets');
	}
}) satisfies PageServerLoad;

// Actions for form submissions
export const actions = {
	// Load budgets from server
	loadBudgets: async ({ locals }) => {
		console.log('🔍 Load budgets action triggered');
		const userId = locals.user?.id;

		if (!userId) {
			console.log('❌ Authentication required - no user ID found');
			return { success: false, error: 'Authentication required' };
		}

		try {
			const budgets = await prisma.budget.findMany({
				where: {
					userId
				},
				include: {
					expenses: true
				},
				orderBy: {
					createdAt: 'desc'
				}
			});

			console.log(`📊 Retrieved ${budgets.length} budgets for user ${userId}`);
			return { success: true, budgets };
		} catch (error) {
			console.error('❌ Error loading budgets:', error);
			return { success: false, error: String(error) };
		}
	},

	// Backup local budgets to server
	backupToServer: async ({ request, locals }) => {
		console.log('🔍 Backup to server action triggered');

		// Check if user is authenticated
		const userId = locals.user?.id;
		console.log('👤 User ID:', userId);

		if (!userId) {
			console.log('❌ Authentication required - no user ID found');
			return { success: false, error: 'Authentication required' };
		}

		try {
			// Handle JSON request instead of formData
			const contentType = request.headers.get('content-type') || '';
			console.log('📄 Content-Type:', contentType);

			let budgets;

			if (contentType.includes('application/json')) {
				// Parse JSON data
				console.log('📦 Parsing JSON data');
				const data = await request.json();
				budgets = data.budgets;
				console.log(`📊 Received ${budgets?.length || 0} budgets from JSON`);
			} else {
				// Handle form data as fallback
				console.log('📦 Parsing form data');
				const data = await request.formData();
				const budgetsJson = data.get('budgets')?.toString();
				console.log('📄 Form data budgets:', budgetsJson ? 'present' : 'missing');

				if (budgetsJson) {
					try {
						budgets = JSON.parse(budgetsJson);
						console.log(`📊 Parsed ${budgets?.length || 0} budgets from form data`);
					} catch (e) {
						console.error('❌ Error parsing budget JSON from form data:', e);
						return { success: false, error: 'Invalid budget data format' };
					}
				}
			}

			if (!budgets || !Array.isArray(budgets) || budgets.length === 0) {
				console.log('❌ No valid budgets to backup');
				return { success: false, error: 'No budgets to backup' };
			}

			console.log(`✅ Processing ${budgets.length} budgets for backup`);

			// Process each budget
			const results = await Promise.all(
				budgets.map(async (budget: any) => {
					console.log(`🔄 Processing budget: ${budget.id} - ${budget.name}`);

					// Check if budget with this ID already exists
					const existingBudget = await prisma.budget.findUnique({
						where: { id: budget.id }
					});

					console.log(`🔍 Existing budget check: ${existingBudget ? 'found' : 'not found'}`);
					if (existingBudget) {
						console.log(`👤 Budget owner: ${existingBudget.userId}, Current user: ${userId}`);
					}

					// If budget exists and belongs to another user, generate a new ID
					const budgetId =
						existingBudget && existingBudget.userId !== userId ? crypto.randomUUID() : budget.id;

					if (budgetId !== budget.id) {
						console.log(`🆔 Generated new budget ID: ${budgetId} (original: ${budget.id})`);
					}

					// Create or update the budget
					console.log(`💾 Upserting budget with ID: ${budgetId}`);
					const newBudget = await prisma.budget.upsert({
						where: { id: budgetId },
						update: {
							name: budget.name,
							amount: budget.amount,
							currency: budget.currency,
							userId
						},
						create: {
							id: budgetId,
							name: budget.name,
							amount: budget.amount,
							currency: budget.currency,
							userId,
							createdAt: new Date(budget.createdAt || new Date())
						}
					});

					console.log(`✅ Budget upserted: ${newBudget.id} - ${newBudget.name}`);

					// Create all expenses for this budget
					if (budget.expenses && budget.expenses.length > 0) {
						console.log(
							`📊 Processing ${budget.expenses.length} expenses for budget ${newBudget.id}`
						);

						await Promise.all(
							budget.expenses.map(async (expense: any) => {
								console.log(`🔄 Processing expense: ${expense.id} - ${expense.description}`);

								// Check if expense already exists
								const existingExpense = await prisma.expense.findUnique({
									where: { id: expense.id }
								});

								console.log(
									`🔍 Existing expense check: ${existingExpense ? 'found' : 'not found'}`
								);

								// Use upsert instead of always creating a new expense
								// This will update if it exists or create if it doesn't
								const expenseResult = await prisma.expense.upsert({
									where: {
										id: expense.id
									},
									update: {
										description: expense.description,
										amount: expense.amount,
										budgetId: newBudget.id
									},
									create: {
										id: expense.id,
										description: expense.description,
										amount: expense.amount,
										budgetId: newBudget.id,
										createdAt: new Date(expense.createdAt || new Date())
									}
								});

								console.log(
									`✅ Expense ${existingExpense ? 'updated' : 'created'}: ${expenseResult.id} - ${expenseResult.description}`
								);
								return expenseResult;
							})
						);

						// Handle expense deletion - remove expenses that exist in DB but not in the current backup
						// First get all existing expenses for this budget
						const existingExpenses = await prisma.expense.findMany({
							where: { budgetId: newBudget.id }
						});

						// Create a set of expense IDs from the current backup
						const currentExpenseIds = new Set(budget.expenses.map((e: any) => e.id));

						// Find expenses that exist in DB but not in current backup (they were deleted)
						const expensesToDelete = existingExpenses.filter((e) => !currentExpenseIds.has(e.id));

						// Delete these expenses
						if (expensesToDelete.length > 0) {
							console.log(`🗑️ Deleting ${expensesToDelete.length} removed expenses`);
							await prisma.expense.deleteMany({
								where: {
									id: {
										in: expensesToDelete.map((e) => e.id)
									}
								}
							});
						}
					} else {
						console.log(`ℹ️ No expenses for budget ${newBudget.id}`);
					}

					return newBudget;
				})
			);

			console.log(`🎉 Backup complete! Migrated ${results.length} budgets`);
			// Return only the MigrationResult shape
			return { success: true, migrated: results.length };
		} catch (error) {
			console.error('❌ Backup error:', error);
			return { success: false, error: String(error) };
		}
	},

	// Delete a budget
	deleteBudget: async ({ request, locals }) => {
		console.log('🗑️ Delete budget action triggered');
		const userId = locals.user?.id;

		if (!userId) {
			console.log('❌ Authentication required - no user ID found');
			return { success: false, error: 'Authentication required' };
		}

		try {
			const data = await request.formData();
			const budgetId = data.get('budgetId')?.toString();

			if (!budgetId) {
				return { success: false, error: 'Budget ID not provided' };
			}

			// Ensure the budget belongs to the current user before deleting
			const budget = await prisma.budget.findFirst({
				where: {
					id: budgetId,
					userId: userId
				}
			});

			if (!budget) {
				return {
					success: false,
					error: 'Budget not found or you do not have permission to delete it'
				};
			}

			await prisma.budget.delete({
				where: {
					id: budgetId
				}
			});

			return { success: true, budgetId };
		} catch (error) {
			console.error('❌ Error deleting budget:', error);
			return { success: false, error: String(error) };
		}
	}
} satisfies Actions;
