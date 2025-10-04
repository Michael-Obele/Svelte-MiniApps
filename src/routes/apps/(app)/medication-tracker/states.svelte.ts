import { PersistedState } from 'runed';

// Types
export interface Medication {
	id: string;
	name: string;
	dosage: string; // e.g., "500mg", "2 tablets"
	frequency: string; // e.g., "twice daily", "every 8 hours"
	instructions?: string;
	startDate: string; // ISO date string
	endDate?: string; // ISO date string
	color: string; // For visual identification
	createdAt: string;
}

export interface TreatmentSession {
	id: string;
	name: string; // e.g., "Flu Treatment - January 2024"
	description?: string;
	startDate: string; // ISO date string
	endDate?: string; // ISO date string, null if ongoing
	medications: Medication[];
	isActive: boolean;
	createdAt: string;
}

export interface MedicationLog {
	id: string;
	sessionId: string;
	medicationId: string;
	scheduledTime: string; // ISO datetime string
	status: 'taken' | 'skipped' | 'missed' | 'pending';
	actualTime?: string; // ISO datetime string - when actually taken
	notes?: string;
	createdAt: string;
}

export interface MedicationStats {
	totalDoses: number;
	takenDoses: number;
	skippedDoses: number;
	missedDoses: number;
	adherenceRate: number; // Percentage
}

// Color palette for medications
export const medicationColors = [
	'#ef4444', // red
	'#f59e0b', // amber
	'#22c55e', // green
	'#3b82f6', // blue
	'#8b5cf6', // purple
	'#ec4899', // pink
	'#06b6d4', // cyan
	'#84cc16', // lime
	'#f97316', // orange
	'#14b8a6' // teal
];

// Frequency presets
export const frequencyPresets = [
	'Once daily',
	'Twice daily',
	'Three times daily',
	'Four times daily',
	'Every 4 hours',
	'Every 6 hours',
	'Every 8 hours',
	'Every 12 hours',
	'As needed',
	'Weekly',
	'Custom'
];

// Persisted state for treatment sessions
export const treatmentSessions = new PersistedState<TreatmentSession[]>(
	'medication-tracker-sessions',
	[],
	{
		storage: 'local',
		syncTabs: true
	}
);

// Persisted state for medication logs
export const medicationLogs = new PersistedState<MedicationLog[]>('medication-tracker-logs', [], {
	storage: 'local',
	syncTabs: true
});

// Helper functions
export function createSession(
	name: string,
	description: string = '',
	startDate: string = new Date().toISOString()
): TreatmentSession {
	return {
		id: crypto.randomUUID(),
		name,
		description,
		startDate,
		endDate: undefined,
		medications: [],
		isActive: true,
		createdAt: new Date().toISOString()
	};
}

export function addSession(session: TreatmentSession): void {
	// Deactivate all other sessions
	treatmentSessions.current = treatmentSessions.current.map((s) => ({
		...s,
		isActive: false
	}));

	// Add new session as active
	treatmentSessions.current = [...treatmentSessions.current, session];
}

export function updateSession(sessionId: string, updates: Partial<TreatmentSession>): void {
	treatmentSessions.current = treatmentSessions.current.map((s) =>
		s.id === sessionId ? { ...s, ...updates } : s
	);
}

export function deleteSession(sessionId: string): void {
	treatmentSessions.current = treatmentSessions.current.filter((s) => s.id !== sessionId);
	// Delete all logs for this session
	medicationLogs.current = medicationLogs.current.filter((log) => log.sessionId !== sessionId);
}

export function setActiveSession(sessionId: string): void {
	treatmentSessions.current = treatmentSessions.current.map((s) => ({
		...s,
		isActive: s.id === sessionId
	}));
}

export function createMedication(
	name: string,
	dosage: string,
	frequency: string,
	instructions: string = '',
	startDate: string = new Date().toISOString(),
	endDate?: string
): Medication {
	const usedColors = treatmentSessions.current.flatMap((s) => s.medications).map((m) => m.color);
	const availableColors = medicationColors.filter((c) => !usedColors.includes(c));
	const color = availableColors.length > 0 ? availableColors[0] : medicationColors[0];

	return {
		id: crypto.randomUUID(),
		name,
		dosage,
		frequency,
		instructions,
		startDate,
		endDate,
		color,
		createdAt: new Date().toISOString()
	};
}

export function addMedicationToSession(sessionId: string, medication: Medication): void {
	treatmentSessions.current = treatmentSessions.current.map((s) => {
		if (s.id === sessionId) {
			return {
				...s,
				medications: [...s.medications, medication]
			};
		}
		return s;
	});
}

export function updateMedication(
	sessionId: string,
	medicationId: string,
	updates: Partial<Medication>
): void {
	treatmentSessions.current = treatmentSessions.current.map((s) => {
		if (s.id === sessionId) {
			return {
				...s,
				medications: s.medications.map((m) => (m.id === medicationId ? { ...m, ...updates } : m))
			};
		}
		return s;
	});
}

export function deleteMedication(sessionId: string, medicationId: string): void {
	treatmentSessions.current = treatmentSessions.current.map((s) => {
		if (s.id === sessionId) {
			return {
				...s,
				medications: s.medications.filter((m) => m.id !== medicationId)
			};
		}
		return s;
	});
	// Delete all logs for this medication
	medicationLogs.current = medicationLogs.current.filter(
		(log) => log.medicationId !== medicationId
	);
}

export function createLog(
	sessionId: string,
	medicationId: string,
	scheduledTime: string,
	status: MedicationLog['status'] = 'pending',
	actualTime?: string,
	notes?: string
): MedicationLog {
	return {
		id: crypto.randomUUID(),
		sessionId,
		medicationId,
		scheduledTime,
		status,
		actualTime,
		notes,
		createdAt: new Date().toISOString()
	};
}

export function addLog(log: MedicationLog): void {
	medicationLogs.current = [...medicationLogs.current, log];
}

export function updateLog(logId: string, updates: Partial<MedicationLog>): void {
	medicationLogs.current = medicationLogs.current.map((log) =>
		log.id === logId ? { ...log, ...updates } : log
	);
}

export function deleteLog(logId: string): void {
	medicationLogs.current = medicationLogs.current.filter((log) => log.id !== logId);
}

export function deletePendingLogsForMedication(medicationId: string): void {
	medicationLogs.current = medicationLogs.current.filter(
		(log) => !(log.medicationId === medicationId && log.status === 'pending')
	);
}

export function getActiveSession(): TreatmentSession | undefined {
	return treatmentSessions.current.find((s) => s.isActive);
}

export function getSessionById(sessionId: string): TreatmentSession | undefined {
	return treatmentSessions.current.find((s) => s.id === sessionId);
}

export function getLogsForSession(sessionId: string): MedicationLog[] {
	return medicationLogs.current.filter((log) => log.sessionId === sessionId);
}

export function getLogsForMedication(medicationId: string): MedicationLog[] {
	return medicationLogs.current.filter((log) => log.medicationId === medicationId);
}

export function getLogsForDateRange(
	sessionId: string,
	startDate: Date,
	endDate: Date
): MedicationLog[] {
	return medicationLogs.current.filter((log) => {
		if (log.sessionId !== sessionId) return false;
		const logDate = new Date(log.scheduledTime);
		return logDate >= startDate && logDate <= endDate;
	});
}

export function calculateStats(sessionId: string, medicationId?: string): MedicationStats {
	let logs = getLogsForSession(sessionId);

	if (medicationId) {
		logs = logs.filter((log) => log.medicationId === medicationId);
	}

	const totalDoses = logs.length;
	const takenDoses = logs.filter((log) => log.status === 'taken').length;
	const skippedDoses = logs.filter((log) => log.status === 'skipped').length;
	const missedDoses = logs.filter((log) => log.status === 'missed').length;
	const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

	return {
		totalDoses,
		takenDoses,
		skippedDoses,
		missedDoses,
		adherenceRate
	};
}

export function getUpcomingLogs(sessionId: string, hours: number = 24): MedicationLog[] {
	const now = new Date();
	const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

	return medicationLogs.current
		.filter((log) => {
			if (log.sessionId !== sessionId) return false;
			if (log.status !== 'pending') return false;
			const logDate = new Date(log.scheduledTime);
			return logDate >= now && logDate <= futureTime;
		})
		.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
}

export function getTodayLogs(sessionId: string): MedicationLog[] {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	return getLogsForDateRange(sessionId, today, tomorrow).sort(
		(a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
	);
}

// Parse frequency string and return times per day
export function parseFrequency(frequency: string): {
	timesPerDay: number;
	suggestedTimes: string[];
} {
	const lower = frequency.toLowerCase();

	// Match patterns like "once daily", "twice daily", "3 times daily", "every X hours"
	if (lower.includes('once') || lower.includes('1')) {
		return { timesPerDay: 1, suggestedTimes: ['09:00'] };
	}
	if (lower.includes('twice') || lower.includes('2')) {
		return { timesPerDay: 2, suggestedTimes: ['09:00', '21:00'] };
	}
	if (lower.includes('three') || lower.includes('3')) {
		return { timesPerDay: 3, suggestedTimes: ['08:00', '14:00', '20:00'] };
	}
	if (lower.includes('four') || lower.includes('4')) {
		return { timesPerDay: 4, suggestedTimes: ['08:00', '12:00', '16:00', '20:00'] };
	}

	// Every X hours patterns
	if (lower.includes('every')) {
		const match = lower.match(/every\s+(\d+)\s+hours?/);
		if (match) {
			const hours = parseInt(match[1]);
			const timesPerDay = Math.floor(24 / hours);
			const suggestedTimes: string[] = [];

			for (let i = 0; i < timesPerDay; i++) {
				const hour = (8 + i * hours) % 24;
				suggestedTimes.push(`${hour.toString().padStart(2, '0')}:00`);
			}

			return { timesPerDay, suggestedTimes };
		}
	}

	// Default: once daily
	return { timesPerDay: 1, suggestedTimes: ['09:00'] };
}

// Calculate expected total doses based on frequency and date range
export function calculateExpectedDoses(
	startDate: string,
	endDate: string | undefined,
	frequency: string
): number {
	const start = new Date(startDate);
	const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

	const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
	const { timesPerDay } = parseFrequency(frequency);

	return days * timesPerDay;
}

// Auto-generate schedule logs based on medication details
export function autoGenerateSchedule(
	sessionId: string,
	medication: Medication,
	customTimes?: string[]
): MedicationLog[] {
	const logs: MedicationLog[] = [];
	const { suggestedTimes } = parseFrequency(medication.frequency);
	const times = customTimes && customTimes.length > 0 ? customTimes : suggestedTimes;

	const startDate = new Date(medication.startDate);
	const endDate = medication.endDate
		? new Date(medication.endDate)
		: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

	const currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		times.forEach((time) => {
			const [hours, minutes] = time.split(':');
			const scheduleDateTime = new Date(currentDate);
			scheduleDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

			logs.push(createLog(sessionId, medication.id, scheduleDateTime.toISOString(), 'pending'));
		});

		currentDate.setDate(currentDate.getDate() + 1);
	}

	return logs;
}
