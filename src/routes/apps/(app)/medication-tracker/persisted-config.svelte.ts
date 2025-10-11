import { PersistedState } from 'runed';

/**
 * Persisted configuration for the medication tracker app
 * Uses PersistedState to store UI preferences that don't need to be in Dexie
 */

// Track if user has seen the how-to guide
export const hasSeenGuide = new PersistedState<boolean>(
	'medication-tracker-has-seen-guide',
	false,
	{
		storage: 'local',
		syncTabs: true
	}
);

// You can add more UI-related persisted states here as needed
// For example:
// export const preferredView = new PersistedState<'today' | 'medications' | 'history' | 'stats'>(
// 	'medication-tracker-preferred-view',
// 	'today',
// 	{ storage: 'local', syncTabs: true }
// );
