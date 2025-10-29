import { PersistedState } from 'runed';
import { projects } from '$lib/index.svelte';

export let filter = new PersistedState('filter', 'done');

// Interface for app usage tracking
export interface AppUsage {
	[appLink: string]: number;
}

// Persisted state to track app usage counts
export const appUsageTracker = new PersistedState<AppUsage>('app-usage-tracker', {});

// Persisted state for tracking when apps were last used
export const appLastUsed = new PersistedState<Record<string, string>>('app-last-used', {});
