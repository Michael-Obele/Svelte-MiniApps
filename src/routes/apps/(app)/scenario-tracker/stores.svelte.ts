import { PersistedState } from 'runed';
import {
	type Option,
	type Activity,
	type TimelineEntry,
	type Risk,
	type DashboardStats,
	DEFAULT_OPTIONS,
	generateId,
	calculateDaysRemaining,
	calculateYearsRemaining
} from './types';

// Default dates: 10 years from now
const DEFAULT_START_DATE = new Date();
const DEFAULT_END_DATE = new Date(DEFAULT_START_DATE.getTime() + 10 * 365.25 * 24 * 60 * 60 * 1000);

// Persisted settings for start/end dates
export const scenarioSettings = new PersistedState<{ startDate: string; endDate: string }>(
	'scenario-tracker-settings',
	{
		startDate: DEFAULT_START_DATE.toISOString(),
		endDate: DEFAULT_END_DATE.toISOString()
	},
	{
		storage: 'local',
		syncTabs: true
	}
);

// Getter for parsed dates
export function getStartDate(): Date {
	return new Date(scenarioSettings.current.startDate);
}

export function getEndDate(): Date {
	return new Date(scenarioSettings.current.endDate);
}

// Update settings
export function updateSettings(startDate: Date, endDate: Date): void {
	scenarioSettings.current = {
		startDate: startDate.toISOString(),
		endDate: endDate.toISOString()
	};
}

// Initialize settings from server data (for authenticated users)
export function initializeFromServer(data: {
	settings: { startDate: string; endDate: string } | null;
	options: Option[] | null;
	timelineEntries: TimelineEntry[] | null;
	risks: Risk[] | null;
}): void {
	if (data.settings) {
		scenarioSettings.current = {
			startDate: data.settings.startDate,
			endDate: data.settings.endDate
		};
	}
	if (data.options) {
		options.current = data.options;
	}
	if (data.timelineEntries) {
		timelineEntries.current = data.timelineEntries;
	}
	if (data.risks) {
		risks.current = data.risks;
	}
}

// Persisted state for options
export const options = new PersistedState<Option[]>('scenario-tracker-options', [], {
	storage: 'local',
	syncTabs: true
});

// Persisted state for timeline entries
export const timelineEntries = new PersistedState<TimelineEntry[]>(
	'scenario-tracker-timeline',
	[],
	{
		storage: 'local',
		syncTabs: true
	}
);

// Persisted state for risks
export const risks = new PersistedState<Risk[]>('scenario-tracker-risks', [], {
	storage: 'local',
	syncTabs: true
});

// Initialize with default options if empty
export function initializeDefaultOptions(): void {
	if (options.current.length === 0) {
		const initialOptions: Option[] = DEFAULT_OPTIONS.map((opt) => ({
			...opt,
			id: generateId(),
			createdAt: new Date().toISOString()
		}));
		options.current = initialOptions;
	}
}

// --- Option CRUD ---

export function addOption(
	name: string,
	description: string,
	color: string,
	allocation: number
): void {
	const newOption: Option = {
		id: generateId(),
		name,
		description,
		color,
		totalTimeSpent: 0,
		progress: 0,
		estimatedTimeToCompletion: 'TBD',
		allocation,
		activities: [],
		createdAt: new Date().toISOString()
	};
	options.current = [...options.current, newOption];
}

export function updateOption(
	id: string,
	updates: Partial<Omit<Option, 'id' | 'createdAt' | 'activities'>>
): void {
	options.current = options.current.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt));
}

export function deleteOption(id: string): void {
	options.current = options.current.filter((opt) => opt.id !== id);
	// Also remove related risks
	risks.current = risks.current.filter((r) => r.optionId !== id);
}

// --- Activity CRUD ---

export function addActivity(
	optionId: string,
	description: string,
	timeSpent: number,
	progressMetric: string,
	status: Activity['status'],
	notes: string
): void {
	const newActivity: Activity = {
		id: generateId(),
		date: new Date().toISOString(),
		description,
		timeSpent,
		progressMetric,
		status,
		notes
	};

	options.current = options.current.map((opt) => {
		if (opt.id === optionId) {
			const updatedActivities = [...opt.activities, newActivity];
			const totalTime = updatedActivities.reduce((sum, a) => sum + a.timeSpent, 0);
			return {
				...opt,
				activities: updatedActivities,
				totalTimeSpent: totalTime
			};
		}
		return opt;
	});
}

export function updateActivity(
	optionId: string,
	activityId: string,
	updates: Partial<Omit<Activity, 'id'>>
): void {
	options.current = options.current.map((opt) => {
		if (opt.id === optionId) {
			const updatedActivities = opt.activities.map((act) =>
				act.id === activityId ? { ...act, ...updates } : act
			);
			const totalTime = updatedActivities.reduce((sum, a) => sum + a.timeSpent, 0);
			return {
				...opt,
				activities: updatedActivities,
				totalTimeSpent: totalTime
			};
		}
		return opt;
	});
}

export function deleteActivity(optionId: string, activityId: string): void {
	options.current = options.current.map((opt) => {
		if (opt.id === optionId) {
			const updatedActivities = opt.activities.filter((act) => act.id !== activityId);
			const totalTime = updatedActivities.reduce((sum, a) => sum + a.timeSpent, 0);
			return {
				...opt,
				activities: updatedActivities,
				totalTimeSpent: totalTime
			};
		}
		return opt;
	});
}

// --- Timeline CRUD ---

export function addTimelineEntry(
	optionsWorked: string[],
	timeAllocation: Record<string, number>,
	outcomes: string,
	adjustments: string
): void {
	const newEntry: TimelineEntry = {
		id: generateId(),
		date: new Date().toISOString(),
		optionsWorked,
		timeAllocation,
		outcomes,
		adjustments
	};
	timelineEntries.current = [newEntry, ...timelineEntries.current];
}

export function updateTimelineEntry(id: string, updates: Partial<Omit<TimelineEntry, 'id'>>): void {
	timelineEntries.current = timelineEntries.current.map((entry) =>
		entry.id === id ? { ...entry, ...updates } : entry
	);
}

export function deleteTimelineEntry(id: string): void {
	timelineEntries.current = timelineEntries.current.filter((entry) => entry.id !== id);
}

// --- Risk CRUD ---

export function addRisk(
	description: string,
	severity: Risk['severity'],
	mitigation: string,
	optionId: string | null
): void {
	const newRisk: Risk = {
		id: generateId(),
		description,
		severity,
		mitigation,
		optionId,
		createdAt: new Date().toISOString()
	};
	risks.current = [...risks.current, newRisk];
}

export function updateRisk(id: string, updates: Partial<Omit<Risk, 'id' | 'createdAt'>>): void {
	risks.current = risks.current.map((risk) => (risk.id === id ? { ...risk, ...updates } : risk));
}

export function deleteRisk(id: string): void {
	risks.current = risks.current.filter((risk) => risk.id !== id);
}

// --- Computed/Derived Values ---

export function getDashboardStats(): DashboardStats {
	const totalTime = options.current.reduce((sum, opt) => sum + opt.totalTimeSpent, 0);
	const avgProgress =
		options.current.length > 0
			? options.current.reduce((sum, opt) => sum + opt.progress, 0) / options.current.length
			: 0;

	const endDate = getEndDate();
	const startDate = getStartDate();

	// Calculate total duration in years
	const totalDuration =
		(endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

	return {
		totalTimeSpent: totalTime,
		averageProgress: Math.round(avgProgress),
		remainingYears: calculateYearsRemaining(endDate),
		remainingDays: calculateDaysRemaining(endDate),
		totalDuration
	};
}

export function getOptionById(id: string): Option | undefined {
	return options.current.find((opt) => opt.id === id);
}

export function getRisksByOption(optionId: string | null): Risk[] {
	return risks.current.filter((r) => r.optionId === optionId);
}

export function getGeneralRisks(): Risk[] {
	return risks.current.filter((r) => r.optionId === null);
}
