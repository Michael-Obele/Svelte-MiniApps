import { PersistedState } from 'runed';
import { browser } from '$app/environment';

// Clear invalid filter value if it exists
if (browser) {
	try {
		const storedFilter = localStorage.getItem('filter');
		if (storedFilter === 'undefined' || storedFilter === 'null') {
			localStorage.removeItem('filter');
		}
	} catch (e) {
		// Ignore errors when accessing localStorage
		console.error('Error accessing localStorage:', e);
	}
}

export let filter = new PersistedState('filter', 'done');

// Interface for app usage tracking
export interface AppUsage {
	[appLink: string]: number;
}

// Persisted state to track app usage counts
export const appUsageTracker = new PersistedState<AppUsage>('app-usage-tracker', {});

// Persisted state for tracking when apps were last used
export const appLastUsed = new PersistedState<Record<string, string>>('app-last-used', {});
