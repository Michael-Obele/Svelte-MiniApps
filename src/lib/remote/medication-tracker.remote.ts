import { query, command } from '$app/server';
import { prisma } from '$lib/server/db';
import { getCurrentUser } from './auth.remote';
import * as v from 'valibot';

// Types matching the medication tracker state
interface Medication {
	id: string;
	name: string;
	dosage: string;
	frequency: string;
	instructions?: string;
	startDate: string;
	endDate?: string;
	color: string;
	createdAt: string;
}

interface MedicationSession {
	id: string;
	name: string;
	description?: string;
	startDate: string;
	endDate?: string;
	medications: Medication[];
	isActive: boolean;
	createdAt: string;
}

interface MedicationLog {
	id: string;
	sessionId: string;
	medicationId: string;
	scheduledTime: string;
	status: 'taken' | 'skipped' | 'missed' | 'pending';
	actualTime?: string;
	notes?: string;
	createdAt: string;
}

// Valibot schemas for validation
const MedicationSchema = v.object({
	id: v.string(),
	name: v.string(),
	dosage: v.string(),
	frequency: v.string(),
	instructions: v.optional(v.string()),
	startDate: v.string(),
	endDate: v.optional(v.string()),
	color: v.string(),
	createdAt: v.string()
});

const MedicationSessionSchema = v.object({
	id: v.string(),
	name: v.string(),
	description: v.optional(v.string()),
	startDate: v.string(),
	endDate: v.optional(v.string()),
	medications: v.array(MedicationSchema),
	isActive: v.boolean(),
	createdAt: v.string()
});

const MedicationLogSchema = v.object({
	id: v.string(),
	sessionId: v.string(),
	medicationId: v.string(),
	scheduledTime: v.string(),
	status: v.union([
		v.literal('taken'),
		v.literal('skipped'),
		v.literal('missed'),
		v.literal('pending')
	]),
	actualTime: v.optional(v.string()),
	notes: v.optional(v.string()),
	createdAt: v.string()
});

const BackupDataSchema = v.object({
	sessions: v.array(MedicationSessionSchema),
	logs: v.array(MedicationLogSchema)
});

// Query to load data from server
export const loadMedicationData = query(async () => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🔍 Loading medication sessions and logs for user: ${user.id}`);

	const [sessions, logs] = await Promise.all([
		prisma.medicationSession.findMany({
			where: { userId: user.id },
			include: {
				medications: true
			},
			orderBy: { createdAt: 'desc' }
		}),
		prisma.medicationLog.findMany({
			where: { session: { userId: user.id } },
			orderBy: { scheduledTime: 'desc' }
		})
	]);

	console.log(
		`📊 Loaded ${sessions.length} sessions and ${logs.length} medication logs for user ${user.id}`
	);

	return {
		sessions: sessions.map((session) => ({
			id: session.id,
			name: session.name,
			description: session.description || undefined,
			startDate: session.startDate.toISOString(),
			endDate: session.endDate ? session.endDate.toISOString() : undefined,
			medications: session.medications.map((med) => ({
				id: med.id,
				name: med.name,
				dosage: med.dosage,
				frequency: med.frequency,
				instructions: med.instructions || undefined,
				startDate: med.startDate.toISOString(),
				endDate: med.endDate ? med.endDate.toISOString() : undefined,
				color: med.color,
				createdAt: med.createdAt.toISOString()
			})),
			isActive: session.isActive,
			createdAt: session.createdAt.toISOString()
		})),
		logs: logs.map((log) => ({
			id: log.id,
			sessionId: log.sessionId,
			medicationId: log.medicationId,
			scheduledTime: log.scheduledTime.toISOString(),
			status: log.status as 'taken' | 'skipped' | 'missed' | 'pending',
			actualTime: log.actualTime ? log.actualTime.toISOString() : undefined,
			notes: log.notes || undefined,
			createdAt: log.createdAt.toISOString()
		}))
	};
});

// Command to backup data to server
export const backupMedicationData = command(
	v.object({
		sessions: v.array(MedicationSessionSchema),
		logs: v.array(MedicationLogSchema)
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(
			`💾 Backing up ${data.sessions.length} sessions and ${data.logs.length} logs for user ${user.id}`
		);

		// Start transaction
		await prisma.$transaction(async (tx) => {
			// Delete existing data
			await tx.medicationLog.deleteMany({
				where: { session: { userId: user.id } }
			});
			await tx.medication.deleteMany({
				where: { session: { userId: user.id } }
			});
			await tx.medicationSession.deleteMany({
				where: { userId: user.id }
			});

			// Insert sessions with medications
			for (const session of data.sessions) {
				await tx.medicationSession.create({
					data: {
						id: session.id,
						name: session.name,
						description: session.description,
						startDate: new Date(session.startDate),
						endDate: session.endDate ? new Date(session.endDate) : null,
						isActive: session.isActive,
						userId: user.id,
						createdAt: new Date(session.createdAt),
						medications: {
							create: session.medications.map((med) => ({
								id: med.id,
								name: med.name,
								dosage: med.dosage,
								frequency: med.frequency,
								instructions: med.instructions,
								startDate: new Date(med.startDate),
								endDate: med.endDate ? new Date(med.endDate) : null,
								color: med.color,
								createdAt: new Date(med.createdAt)
							}))
						}
					}
				});
			}

			// Insert logs
			if (data.logs.length > 0) {
				await tx.medicationLog.createMany({
					data: data.logs.map((log) => ({
						id: log.id,
						sessionId: log.sessionId,
						medicationId: log.medicationId,
						scheduledTime: new Date(log.scheduledTime),
						actualTime: log.actualTime ? new Date(log.actualTime) : null,
						status: log.status,
						notes: log.notes,
						createdAt: new Date(log.createdAt)
					}))
				});
			}
		});

		console.log(`✅ Successfully backed up medication data for user ${user.id}`);

		return { success: true };
	}
);

// Command to sync data (merge local and server data)
export const syncMedicationData = command(
	v.object({
		sessions: v.array(MedicationSessionSchema),
		logs: v.array(MedicationLogSchema)
	}),
	async (localData) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(`🔄 Syncing medication data for user ${user.id}`);

		// Load server data
		const serverData = await loadMedicationData();

		// Merge logic: Keep the most recent data based on createdAt/updatedAt
		const mergedSessions = new Map<string, MedicationSession>();
		const mergedLogs = new Map<string, MedicationLog>();

		// Add server sessions
		serverData.sessions.forEach((session) => {
			mergedSessions.set(session.id, session);
		});

		// Add or update with local sessions
		localData.sessions.forEach((session) => {
			const existing = mergedSessions.get(session.id);
			if (!existing || new Date(session.createdAt) > new Date(existing.createdAt)) {
				mergedSessions.set(session.id, session);
			}
		});

		// Add server logs
		serverData.logs.forEach((log) => {
			mergedLogs.set(log.id, log);
		});

		// Add or update with local logs
		localData.logs.forEach((log) => {
			const existing = mergedLogs.get(log.id);
			if (!existing || new Date(log.createdAt) > new Date(existing.createdAt)) {
				mergedLogs.set(log.id, log);
			}
		});

		// Save merged data back to server
		const mergedData = {
			sessions: Array.from(mergedSessions.values()),
			logs: Array.from(mergedLogs.values())
		};

		await backupMedicationData(mergedData);

		console.log(`✅ Successfully synced medication data for user ${user.id}`);

		return mergedData;
	}
);

// Command to delete a session
export const deleteMedicationSession = command(
	v.object({ sessionId: v.string() }),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(`🗑️ Deleting medication session ${data.sessionId} for user ${user.id}`);

		await prisma.medicationSession.delete({
			where: {
				id: data.sessionId,
				userId: user.id
			}
		});

		console.log(`✅ Successfully deleted session ${data.sessionId}`);

		return { success: true };
	}
);

// Command to delete a medication
export const deleteMedication = command(v.object({ medicationId: v.string() }), async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🗑️ Deleting medication ${data.medicationId} for user ${user.id}`);

	// Verify ownership through session
	await prisma.medication.delete({
		where: {
			id: data.medicationId,
			session: { userId: user.id }
		}
	});

	console.log(`✅ Successfully deleted medication ${data.medicationId}`);

	return { success: true };
});

// Command to delete a log
export const deleteMedicationLog = command(v.object({ logId: v.string() }), async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🗑️ Deleting medication log ${data.logId} for user ${user.id}`);

	// Verify ownership through session
	await prisma.medicationLog.delete({
		where: {
			id: data.logId,
			session: { userId: user.id }
		}
	});

	console.log(`✅ Successfully deleted log ${data.logId}`);

	return { success: true };
});
