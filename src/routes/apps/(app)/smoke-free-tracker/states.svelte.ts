import { PersistedState } from 'runed';
import { browser } from '$app/environment';

// ===========================
// TYPES & INTERFACES
// ===========================

export interface SmokingAttempt {
	id: string;
	startDate: string;
	lastSmokeDate: string;
	isActive: boolean;
	longestStreak: number; // in minutes
	resetCount: number;
	endDate?: string;
	customStartDate?: string; // For users who started before using the app
}

export interface CravingLog {
	id: string;
	attemptId: string;
	timestamp: string;
	intensity: number; // 1-5
	trigger?: string;
	copingStrategy?: string;
	notes?: string;
	success: boolean; // Did they resist?
}

export interface UserSettings {
	cigarettesPerDay: number;
	pricePerPack: number;
	cigarettesPerPack: number;
	currency: string;
	motivationalGoals: string[];
	customStartDateEnabled: boolean;
}

export interface Milestone {
	id: string;
	name: string;
	description: string;
	duration: number; // in minutes
	icon: string;
}

// ===========================
// PERSISTED STATE
// ===========================

// Smoking attempts history
export const smokingAttempts = new PersistedState<SmokingAttempt[]>(
	'smoke-free-tracker:attempts',
	[]
);

// Craving logs
export const cravingLogs = new PersistedState<CravingLog[]>('smoke-free-tracker:cravings', []);

// User settings
export const userSettings = new PersistedState<UserSettings>('smoke-free-tracker:settings', {
	cigarettesPerDay: 20,
	pricePerPack: 10,
	cigarettesPerPack: 20,
	currency: '$',
	motivationalGoals: [],
	customStartDateEnabled: false
});

// Last backup time
export const lastBackupTime = new PersistedState<string | null>(
	'smoke-free-tracker:last-backup-time',
	null
);

// ===========================
// MILESTONES (Health benefits timeline)
// ===========================

export function getDefaultMilestones(): Milestone[] {
	return [
		{
			id: '20min',
			name: '20 Minutes',
			description: 'Heart rate and blood pressure drop to normal levels',
			duration: 20,
			icon: '💓'
		},
		{
			id: '2hours',
			name: '2 Hours',
			description: 'Nicotine cravings peak but will decrease over time',
			duration: 120,
			icon: '🧘'
		},
		{
			id: '12hours',
			name: '12 Hours',
			description: 'Carbon monoxide level in blood drops to normal',
			duration: 720,
			icon: '🫁'
		},
		{
			id: '24hours',
			name: '24 Hours',
			description: 'Anxiety peaks but will improve. Risk of heart attack begins to drop',
			duration: 1440,
			icon: '❤️'
		},
		{
			id: '48hours',
			name: '48 Hours',
			description: 'Nerve endings start regrowing. Smell and taste improve',
			duration: 2880,
			icon: '👃'
		},
		{
			id: '3days',
			name: '3 Days',
			description: 'Breathing becomes easier. Bronchial tubes begin to relax',
			duration: 4320,
			icon: '🌬️'
		},
		{
			id: '1week',
			name: '1 Week',
			description: "You've made it through the hardest part! Cravings are less intense",
			duration: 10080,
			icon: '🎉'
		},
		{
			id: '2weeks',
			name: '2 Weeks',
			description: 'Circulation improves. Walking and exercise become easier',
			duration: 20160,
			icon: '🚶'
		},
		{
			id: '1month',
			name: '1 Month',
			description: 'Lung function begins to improve. Coughing and shortness of breath decrease',
			duration: 43200,
			icon: '🏆'
		},
		{
			id: '3months',
			name: '3 Months',
			description: 'Circulation and lung function continue to improve',
			duration: 129600,
			icon: '💪'
		},
		{
			id: '6months',
			name: '6 Months',
			description: 'Stress levels normalize. Breathing problems continue to decrease',
			duration: 259200,
			icon: '🌟'
		},
		{
			id: '1year',
			name: '1 Year',
			description: 'Risk of coronary heart disease is half that of a smoker!',
			duration: 525600,
			icon: '🎊'
		}
	];
}

// ===========================
// MOTIVATIONAL DATA
// ===========================

export function getMotivationalQuotes() {
	return [
		'Every minute smoke-free is a victory! 🏆',
		"You're stronger than your cravings! 💪",
		'Think of how much healthier your body is becoming! ❤️',
		'Your lungs are thanking you right now! 🫁',
		"You're saving money and your life! 💰",
		'Cravings are temporary, but your health is forever! ⏳',
		"Look how far you've come! Keep going! 🚀",
		"You're proving to yourself that you can do hard things! 🌟",
		'Every day smoke-free is a gift to your future self! 🎁',
		"You're inspiring others by your commitment! 👏"
	];
}

export function getCommonTriggers() {
	return [
		'Stress',
		'After meals',
		'With coffee',
		'Social situations',
		'Boredom',
		'Alcohol',
		'Driving',
		'Work break',
		'Seeing others smoke',
		'Morning routine'
	];
}

export function getCopingStrategies() {
	return [
		'Deep breathing',
		'Drink water',
		'Chew gum',
		'Go for a walk',
		'Call a friend',
		'Exercise',
		'Meditation',
		'Distract yourself',
		'Eat healthy snack',
		'Review your goals'
	];
}

// ===========================
// HELPER FUNCTIONS
// ===========================

export function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDuration(minutes: number): string {
	if (minutes < 60) {
		return `${Math.floor(minutes)} minute${Math.floor(minutes) !== 1 ? 's' : ''}`;
	} else if (minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		const mins = Math.floor(minutes % 60);
		return `${hours} hour${hours !== 1 ? 's' : ''}${mins > 0 ? ` ${mins} min${mins !== 1 ? 's' : ''}` : ''}`;
	} else {
		const days = Math.floor(minutes / 1440);
		const hours = Math.floor((minutes % 1440) / 60);
		return `${days} day${days !== 1 ? 's' : ''}${hours > 0 ? ` ${hours} hour${hours !== 1 ? 's' : ''}` : ''}`;
	}
}

export function getAttemptDuration(attempt: SmokingAttempt): number {
	if (attempt.isActive || !attempt.endDate) return 0;

	const start = new Date(attempt.startDate).getTime();
	const end = new Date(attempt.endDate).getTime();
	const durationMs = end - start;

	return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
}

export function getOverallLongestStreak(): number {
	if (!browser) return 0;

	const attempts = smokingAttempts.current;
	if (attempts.length === 0) return 0;

	return Math.max(...attempts.map((attempt) => attempt.longestStreak));
}

export function getActiveAttempt(): SmokingAttempt | undefined {
	const activeAttempts = smokingAttempts.current.filter((a) => a.isActive);
	if (activeAttempts.length === 0) return undefined;
	if (activeAttempts.length === 1) return activeAttempts[0];

	// Multiple active attempts found - this shouldn't happen, but handle it gracefully
	console.warn(`⚠️ Found ${activeAttempts.length} active attempts, keeping only the most recent`);
	// Sort by start date descending (most recent first)
	activeAttempts.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
	const mostRecent = activeAttempts[0];

	// Deactivate all others
	smokingAttempts.current = smokingAttempts.current.map((a) =>
		a.id === mostRecent.id
			? a
			: { ...a, isActive: false, endDate: a.endDate || new Date().toISOString() }
	);

	return mostRecent;
}
export function getStreakMinutes(attempt: SmokingAttempt): number {
	if (!browser) return 0;
	const lastSmokeTime = new Date(attempt.lastSmokeDate).getTime();
	const now = Date.now();
	return Math.floor((now - lastSmokeTime) / (1000 * 60));
}

export function getDisplayStreakMinutes(attempt: SmokingAttempt): number {
	if (!browser) return 0;
	const displayStartTime = new Date(getDisplayStartDate(attempt)).getTime();
	const now = Date.now();
	return Math.floor((now - displayStartTime) / (1000 * 60));
}

export function getDisplayStartDate(attempt: SmokingAttempt): string {
	if (userSettings.current.customStartDateEnabled) {
		return attempt.customStartDate || attempt.startDate;
	}
	return attempt.startDate;
}

export function setCustomStartDate(attemptId: string, customStartDate: string): boolean {
	if (!browser) return false;

	const attempt = smokingAttempts.current.find((a) => a.id === attemptId);
	if (!attempt) return false;

	// Validate that custom start date is not in the future
	const customDate = new Date(customStartDate);
	const now = new Date();
	if (customDate > now) return false;

	// Validate that custom start date is not after last smoke date
	const lastSmokeDate = new Date(attempt.lastSmokeDate);
	if (customDate > lastSmokeDate) return false;

	smokingAttempts.current = smokingAttempts.current.map((a) =>
		a.id === attemptId ? { ...a, customStartDate } : a
	);

	return true;
}

export function addAttempt(): SmokingAttempt | undefined {
	if (!browser) return undefined;

	// Deactivate any existing active attempts
	const previouslyActive = smokingAttempts.current.filter((a) => a.isActive);
	if (previouslyActive.length > 0) {
		console.log(`🔄 Deactivating ${previouslyActive.length} previously active attempts`);
	}
	smokingAttempts.current = smokingAttempts.current.map((a) => ({
		...a,
		isActive: false,
		endDate: a.isActive ? new Date().toISOString() : a.endDate
	}));

	const newAttempt: SmokingAttempt = {
		id: generateId(),
		startDate: new Date().toISOString(),
		lastSmokeDate: new Date().toISOString(),
		isActive: true,
		longestStreak: 0,
		resetCount: 0
	};

	smokingAttempts.current = [...smokingAttempts.current, newAttempt];
	console.log(`✅ Created new attempt: ${newAttempt.id}`);
	return newAttempt;
}

export function resetAttempt(attemptId: string): SmokingAttempt | undefined {
	if (!browser) return undefined;

	const attempt = smokingAttempts.current.find((a) => a.id === attemptId);
	if (!attempt) return undefined;

	const currentStreak = getStreakMinutes(attempt);
	const newLongestStreak = Math.max(attempt.longestStreak, currentStreak);

	console.log(
		`🔄 Resetting attempt ${attemptId} (streak: ${currentStreak}min, longest: ${newLongestStreak}min)`
	);

	// Mark the current attempt as completed
	smokingAttempts.current = smokingAttempts.current.map((a) =>
		a.id === attemptId
			? {
					...a,
					isActive: false,
					endDate: new Date().toISOString(),
					longestStreak: newLongestStreak
				}
			: a
	);

	// Create a new attempt with incremented resetCount
	const newAttempt: SmokingAttempt = {
		id: generateId(),
		startDate: new Date().toISOString(),
		lastSmokeDate: new Date().toISOString(),
		isActive: true,
		longestStreak: 0,
		resetCount: attempt.resetCount + 1
	};

	smokingAttempts.current = [...smokingAttempts.current, newAttempt];
	console.log(`✅ Created reset attempt: ${newAttempt.id} (reset count: ${newAttempt.resetCount})`);
	return newAttempt;
}

export function addCravingLog(
	attemptId: string,
	intensity: number,
	trigger: string | undefined,
	copingStrategy: string | undefined,
	notes: string | undefined,
	success: boolean
): CravingLog | undefined {
	if (!browser) return undefined;

	const newLog: CravingLog = {
		id: generateId(),
		attemptId,
		timestamp: new Date().toISOString(),
		intensity,
		trigger,
		copingStrategy,
		notes,
		success
	};

	cravingLogs.current = [...cravingLogs.current, newLog];
	return newLog;
}

// Alias for addCravingLog (used by CravingLogger component)
export function logCraving(
	attemptId: string,
	intensity: number,
	trigger: string | undefined,
	copingStrategy: string | undefined,
	notes: string | undefined,
	success: boolean
): CravingLog | undefined {
	return addCravingLog(attemptId, intensity, trigger, copingStrategy, notes, success);
}

export function getAttemptCravings(attemptId: string): CravingLog[] {
	return cravingLogs.current.filter((log) => log.attemptId === attemptId);
}

// Alias for getAttemptCravings (used by CravingLogger component)
export function getCravingsForAttempt(attemptId: string): CravingLog[] {
	return getAttemptCravings(attemptId);
}

export function deleteCravingLog(logId: string): void {
	if (!browser) return;
	cravingLogs.current = cravingLogs.current.filter((log) => log.id !== logId);
}

export function updateSettings(newSettings: Partial<UserSettings>): void {
	if (!browser) return;
	const oldSettings = { ...userSettings.current };
	userSettings.current = {
		...userSettings.current,
		...newSettings
	};
	console.log('🔧 Settings updated:', {
		old: oldSettings,
		new: newSettings,
		result: userSettings.current
	});
}

// ===========================
// STATISTICS CALCULATIONS
// ===========================

export interface Statistics {
	streakMinutes: number;
	streakFormatted: string;
	longestStreak: string;
	moneySaved: number;
	cigarettesAvoided: number;
	totalCravings: number;
	successfulCravings: number;
	cravingSuccessRate: number;
	achievedMilestones: Milestone[];
	nextMilestone: Milestone | null;
	resetCount: number;
}

export function getStatistics(attempt: SmokingAttempt, settings: UserSettings): Statistics {
	const streakMinutes = settings.customStartDateEnabled
		? getDisplayStreakMinutes(attempt)
		: getStreakMinutes(attempt);
	const cravings = getAttemptCravings(attempt.id);

	const cigarettesAvoided = Math.floor((streakMinutes / 1440) * settings.cigarettesPerDay);
	const packsAvoided = cigarettesAvoided / settings.cigarettesPerPack;
	const moneySaved = packsAvoided * settings.pricePerPack;

	const successfulCravings = cravings.filter((c) => c.success).length;
	const cravingSuccessRate =
		cravings.length > 0 ? Math.round((successfulCravings / cravings.length) * 100) : 0;

	const achievedMilestones = getDefaultMilestones().filter((m) => streakMinutes >= m.duration);
	const nextMilestone = getDefaultMilestones().find((m) => streakMinutes < m.duration) || null;

	return {
		streakMinutes,
		streakFormatted: formatDuration(streakMinutes),
		longestStreak: formatDuration(attempt.longestStreak),
		moneySaved,
		cigarettesAvoided,
		totalCravings: cravings.length,
		successfulCravings,
		cravingSuccessRate,
		achievedMilestones,
		nextMilestone,
		resetCount: attempt.resetCount
	};
}
