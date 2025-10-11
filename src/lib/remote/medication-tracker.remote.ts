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
	updatedAt: string;
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
	updatedAt: string;
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
	createdAt: v.string(),
	updatedAt: v.string()
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
	createdAt: v.string(),
	updatedAt: v.string()
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
			mergedSessions.set(session.id, {
				...session,
				updatedAt: (session as any).updatedAt || session.createdAt
			});
		});

		// Add or update with local sessions
		localData.sessions.forEach((session) => {
			const existing = mergedSessions.get(session.id);
			if (!existing || new Date(session.updatedAt) > new Date(existing.updatedAt)) {
				mergedSessions.set(session.id, session);
			}
		});

		// Add server logs
		serverData.logs.forEach((log) => {
			mergedLogs.set(log.id, {
				...log,
				updatedAt: (log as any).updatedAt || log.createdAt
			});
		});

		// Add or update with local logs
		localData.logs.forEach((log) => {
			const existing = mergedLogs.get(log.id);
			if (!existing || new Date(log.updatedAt) > new Date(existing.updatedAt)) {
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

// Command to update a single log (for granular updates)
export const updateMedicationLog = command(
	v.object({
		logId: v.string(),
		status: v.optional(
			v.union([v.literal('taken'), v.literal('skipped'), v.literal('missed'), v.literal('pending')])
		),
		actualTime: v.optional(v.string()),
		notes: v.optional(v.string()),
		scheduledTime: v.optional(v.string())
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(`📝 Updating medication log ${data.logId} for user ${user.id}`);

		// Verify ownership and update
		const updatedLog = await prisma.medicationLog.update({
			where: {
				id: data.logId,
				session: { userId: user.id }
			},
			data: {
				...(data.status && { status: data.status }),
				...(data.actualTime && { actualTime: new Date(data.actualTime) }),
				...(data.notes !== undefined && { notes: data.notes }),
				...(data.scheduledTime && { scheduledTime: new Date(data.scheduledTime) })
			}
		});

		console.log(`✅ Successfully updated log ${data.logId}`);

		return {
			success: true,
			log: {
				id: updatedLog.id,
				sessionId: updatedLog.sessionId,
				medicationId: updatedLog.medicationId,
				scheduledTime: updatedLog.scheduledTime.toISOString(),
				status: updatedLog.status as 'taken' | 'skipped' | 'missed' | 'pending',
				actualTime: updatedLog.actualTime ? updatedLog.actualTime.toISOString() : undefined,
				notes: updatedLog.notes || undefined,
				createdAt: updatedLog.createdAt.toISOString()
			}
		};
	}
);

// Command to create a new log
export const createMedicationLog = command(MedicationLogSchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`➕ Creating medication log for user ${user.id}`);

	// Verify the session belongs to the user
	const session = await prisma.medicationSession.findFirst({
		where: {
			id: data.sessionId,
			userId: user.id
		}
	});

	if (!session) {
		throw new Error('Session not found or unauthorized');
	}

	// Create the log
	const createdLog = await prisma.medicationLog.create({
		data: {
			id: data.id,
			sessionId: data.sessionId,
			medicationId: data.medicationId,
			scheduledTime: new Date(data.scheduledTime),
			actualTime: data.actualTime ? new Date(data.actualTime) : null,
			status: data.status,
			notes: data.notes,
			createdAt: new Date(data.createdAt)
		}
	});

	console.log(`✅ Successfully created log ${createdLog.id}`);

	return {
		success: true,
		log: {
			id: createdLog.id,
			sessionId: createdLog.sessionId,
			medicationId: createdLog.medicationId,
			scheduledTime: createdLog.scheduledTime.toISOString(),
			status: createdLog.status as 'taken' | 'skipped' | 'missed' | 'pending',
			actualTime: createdLog.actualTime ? createdLog.actualTime.toISOString() : undefined,
			notes: createdLog.notes || undefined,
			createdAt: createdLog.createdAt.toISOString()
		}
	};
});

// Command to update a session
export const updateMedicationSession = command(
	v.object({
		sessionId: v.string(),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		isActive: v.optional(v.boolean())
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(`📝 Updating medication session ${data.sessionId} for user ${user.id}`);

		// If setting to active, deactivate all other sessions first
		if (data.isActive === true) {
			await prisma.medicationSession.updateMany({
				where: {
					userId: user.id,
					id: { not: data.sessionId }
				},
				data: { isActive: false }
			});
		}

		const updatedSession = await prisma.medicationSession.update({
			where: {
				id: data.sessionId,
				userId: user.id
			},
			data: {
				...(data.name && { name: data.name }),
				...(data.description !== undefined && { description: data.description }),
				...(data.startDate && { startDate: new Date(data.startDate) }),
				...(data.endDate !== undefined && {
					endDate: data.endDate ? new Date(data.endDate) : null
				}),
				...(data.isActive !== undefined && { isActive: data.isActive })
			},
			include: { medications: true }
		});

		console.log(`✅ Successfully updated session ${data.sessionId}`);

		return {
			success: true,
			session: {
				id: updatedSession.id,
				name: updatedSession.name,
				description: updatedSession.description || undefined,
				startDate: updatedSession.startDate.toISOString(),
				endDate: updatedSession.endDate ? updatedSession.endDate.toISOString() : undefined,
				medications: updatedSession.medications.map((med) => ({
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
				isActive: updatedSession.isActive,
				createdAt: updatedSession.createdAt.toISOString()
			}
		};
	}
);

// Command to create a session
export const createMedicationSession = command(MedicationSessionSchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`➕ Creating medication session for user ${user.id}`);

	// If setting to active, deactivate all other sessions first
	if (data.isActive) {
		await prisma.medicationSession.updateMany({
			where: { userId: user.id },
			data: { isActive: false }
		});
	}

	const createdSession = await prisma.medicationSession.create({
		data: {
			id: data.id,
			name: data.name,
			description: data.description,
			startDate: new Date(data.startDate),
			endDate: data.endDate ? new Date(data.endDate) : null,
			isActive: data.isActive,
			userId: user.id,
			createdAt: new Date(data.createdAt),
			medications: {
				create: data.medications.map((med) => ({
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
		},
		include: { medications: true }
	});

	console.log(`✅ Successfully created session ${createdSession.id}`);

	return {
		success: true,
		session: {
			id: createdSession.id,
			name: createdSession.name,
			description: createdSession.description || undefined,
			startDate: createdSession.startDate.toISOString(),
			endDate: createdSession.endDate ? createdSession.endDate.toISOString() : undefined,
			medications: createdSession.medications.map((med) => ({
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
			isActive: createdSession.isActive,
			createdAt: createdSession.createdAt.toISOString()
		}
	};
});
