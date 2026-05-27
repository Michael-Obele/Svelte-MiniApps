import { randomBytes } from 'node:crypto';

export function createBudgetShareToken() {
	return randomBytes(24).toString('base64url');
}

export function getBudgetSharePath(token: string) {
	return `/apps/budget-tracker/share/${token}`;
}
