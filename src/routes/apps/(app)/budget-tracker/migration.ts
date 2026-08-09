import { toast } from 'svelte-sonner';
import * as budgetState from '$lib/budget-tracker/states.svelte';

/**
 * Checks if local data has been migrated to the server
 * @returns boolean indicating if data has been migrated
 */
export function isDataMigrated(): boolean {
	return localStorage.getItem('budgets_migrated') === 'true';
}
