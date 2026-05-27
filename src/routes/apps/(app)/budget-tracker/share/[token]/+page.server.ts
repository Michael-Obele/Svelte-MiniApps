import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const prerender = false;

export const load = (async ({ params }) => {
	const budget = await prisma.budget.findFirst({
		where: {
			shareToken: params.token,
			isPublic: true
		},
		select: {
			id: true,
			name: true,
			amount: true,
			currency: true,
			createdAt: true,
			updatedAt: true,
			expenses: {
				orderBy: {
					createdAt: 'desc'
				},
				select: {
					id: true,
					description: true,
					amount: true,
					createdAt: true
				}
			}
		}
	});

	if (!budget) {
		error(404, 'Budget not found');
	}

	return {
		budget: {
			id: budget.id,
			name: budget.name,
			amount: budget.amount,
			currency: budget.currency,
			createdAt: budget.createdAt.toISOString(),
			updatedAt: budget.updatedAt.toISOString(),
			expenses: budget.expenses.map((expense) => ({
				id: expense.id,
				description: expense.description,
				amount: expense.amount,
				createdAt: expense.createdAt.toISOString()
			}))
		}
	};
}) satisfies PageServerLoad;
