import { getRequestEvent, query, form } from '$app/server';
import { prisma } from '$lib/server/db';
import { createBudgetShareToken, getBudgetSharePath } from '$lib/server/budget-sharing';
import * as v from 'valibot';

export type BudgetShareSettings = {
	canShare: boolean;
	reason: 'ready' | 'unauthenticated' | 'not-backed-up';
	isPublic: boolean;
	hasShareToken: boolean;
	sharePath: string | null;
	updatedAt: string | null;
};

const budgetShareSchema = v.object({
	budgetId: v.pipe(v.string(), v.nonEmpty()),
	isPublic: v.pipe(
		v.any(),
		v.transform((val) => {
			if (typeof val === 'boolean') return val;
			if (typeof val === 'string') return val === 'true';
			return false;
		})
	)
});

const budgetShareTokenSchema = v.object({
	budgetId: v.pipe(v.string(), v.nonEmpty())
});

async function getOwnedBudget(budgetId: string, userId: string) {
	return prisma.budget.findFirst({
		where: {
			id: budgetId,
			userId
		},
		select: {
			id: true,
			isPublic: true,
			shareToken: true,
			updatedAt: true
		}
	});
}

export const getBudgetShareSettings = query(
	v.string(),
	async (budgetId): Promise<BudgetShareSettings> => {
		const event = getRequestEvent();
		const userId = event?.locals.user?.id;

		if (!userId) {
			return {
				canShare: false,
				reason: 'unauthenticated',
				isPublic: false,
				hasShareToken: false,
				sharePath: null,
				updatedAt: null
			};
		}

		const budget = await getOwnedBudget(budgetId, userId);

		if (!budget) {
			return {
				canShare: false,
				reason: 'not-backed-up',
				isPublic: false,
				hasShareToken: false,
				sharePath: null,
				updatedAt: null
			};
		}

		return {
			canShare: true,
			reason: 'ready',
			isPublic: budget.isPublic,
			hasShareToken: !!budget.shareToken,
			sharePath:
				budget.isPublic && budget.shareToken ? getBudgetSharePath(budget.shareToken) : null,
			updatedAt: budget.updatedAt.toISOString()
		};
	}
);

export const setBudgetSharing = form(budgetShareSchema, async ({ budgetId, isPublic }) => {
	const event = getRequestEvent();
	const userId = event?.locals.user?.id;

	if (!userId) {
		throw new Error('Sign in to manage budget sharing.');
	}

	const budget = await getOwnedBudget(budgetId, userId);

	if (!budget) {
		throw new Error('Back up this budget to your account before sharing it.');
	}

	await prisma.budget.update({
		where: { id: budget.id },
		data: {
			isPublic,
			shareToken: isPublic ? (budget.shareToken ?? createBudgetShareToken()) : budget.shareToken
		}
	});

	await getBudgetShareSettings(budgetId).refresh();

	return { success: true };
});

export const regenerateBudgetShareLink = form(budgetShareTokenSchema, async ({ budgetId }) => {
	const event = getRequestEvent();
	const userId = event?.locals.user?.id;

	if (!userId) {
		throw new Error('Sign in to regenerate the share link.');
	}

	const budget = await getOwnedBudget(budgetId, userId);

	if (!budget) {
		throw new Error('Back up this budget to your account before sharing it.');
	}

	await prisma.budget.update({
		where: { id: budget.id },
		data: {
			shareToken: createBudgetShareToken()
		}
	});

	await getBudgetShareSettings(budgetId).refresh();

	return { success: true };
});
