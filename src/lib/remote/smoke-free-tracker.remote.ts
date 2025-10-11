import { query, command } from '$app/server';
import { prisma } from '$lib/server/db';
import { getCurrentUser } from './auth.remote';
import * as v from 'valibot';

// Types matching the smoke-free tracker state
interface SmokingAttempt {
	id: string;
	startDate: string;
	lastSmokeDate: string;
	isActive: boolean;
	longestStreak: number;
	resetCount: number;
	endDate?: string;
}

interface CravingLog {
	id: string;
	attemptId: string;
	timestamp: string;
	intensity: number;
	trigger?: string;
	copingStrategy?: string;
	notes?: string;
	success: boolean;
}

// Valibot schemas for validation
const SmokingAttemptSchema = v.object({
	id: v.string(),
	startDate: v.string(),
	lastSmokeDate: v.string(),
	isActive: v.boolean(),
	longestStreak: v.number(),
	resetCount: v.number(),
	endDate: v.optional(v.string())
});

const CravingLogSchema = v.object({
	id: v.string(),
	attemptId: v.string(),
	timestamp: v.string(),
	intensity: v.number(),
	trigger: v.optional(v.string()),
	copingStrategy: v.optional(v.string()),
	notes: v.optional(v.string()),
	success: v.boolean()
});

const BackupDataSchema = v.object({
	attempts: v.array(SmokingAttemptSchema),
	cravings: v.array(CravingLogSchema)
});

// Query to load data from server
export const loadSmokeFreeData = query(async () => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🔍 Loading smoke-free tracker data for user: ${user.id}`);

	const [attempts, cravings] = await Promise.all([
		prisma.smokingAttempt.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		}),
		prisma.cravingLog.findMany({
			where: { attempt: { userId: user.id } },
			orderBy: { timestamp: 'desc' }
		})
	]);

	console.log(
		`📊 Loaded ${attempts.length} attempts and ${cravings.length} craving logs for user ${user.id}`
	);

	return {
		attempts: attempts.map((attempt) => ({
			id: attempt.id,
			startDate: attempt.startDate.toISOString(),
			lastSmokeDate: attempt.lastSmokeDate.toISOString(),
			isActive: attempt.isActive,
			longestStreak: attempt.longestStreak,
			resetCount: attempt.resetCount,
			endDate: attempt.endDate ? attempt.endDate.toISOString() : undefined
		})),
		cravings: cravings.map((craving) => ({
			id: craving.id,
			attemptId: craving.attemptId,
			timestamp: craving.timestamp.toISOString(),
			intensity: craving.intensity,
			trigger: craving.trigger || undefined,
			copingStrategy: craving.copingStrategy || undefined,
			notes: craving.notes || undefined,
			success: craving.success
		}))
	};
});

// Command to backup data to server
export const backupSmokeFreeData = command(
	v.object({
		attempts: v.array(SmokingAttemptSchema),
		cravings: v.array(CravingLogSchema)
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(
			`💾 Backing up ${data.attempts.length} attempts and ${data.cravings.length} cravings for user ${user.id}`
		);

		// Start transaction
		await prisma.$transaction(async (tx) => {
			// Delete existing data
			await tx.cravingLog.deleteMany({
				where: { attempt: { userId: user.id } }
			});
			await tx.smokingAttempt.deleteMany({
				where: { userId: user.id }
			});

			// Insert attempts
			for (const attempt of data.attempts) {
				await tx.smokingAttempt.create({
					data: {
						id: attempt.id,
						startDate: new Date(attempt.startDate),
						lastSmokeDate: new Date(attempt.lastSmokeDate),
						isActive: attempt.isActive,
						longestStreak: attempt.longestStreak,
						resetCount: attempt.resetCount,
						endDate: attempt.endDate ? new Date(attempt.endDate) : null,
						userId: user.id
					}
				});
			}

			// Insert cravings
			if (data.cravings.length > 0) {
				await tx.cravingLog.createMany({
					data: data.cravings.map((craving) => ({
						id: craving.id,
						attemptId: craving.attemptId,
						timestamp: new Date(craving.timestamp),
						intensity: craving.intensity,
						trigger: craving.trigger,
						copingStrategy: craving.copingStrategy,
						notes: craving.notes,
						success: craving.success
					}))
				});
			}
		});

		console.log(`✅ Successfully backed up smoke-free tracker data for user ${user.id}`);

		return { success: true };
	}
);

// Command to sync data (merge local and server data)
export const syncSmokeFreeData = command(
	v.object({
		attempts: v.array(SmokingAttemptSchema),
		cravings: v.array(CravingLogSchema)
	}),
	async (localData) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(`🔄 Syncing smoke-free tracker data for user ${user.id}`);

		// Load server data
		const serverData = await loadSmokeFreeData();

		// For now, we'll use a simple strategy: if local data is newer than server data,
		// backup local data. Otherwise, return server data for client to merge.
		// A more sophisticated merge strategy could be implemented later.

		const localLatest =
			localData.attempts.length > 0
				? new Date(Math.max(...localData.attempts.map((a) => new Date(a.startDate).getTime())))
				: new Date(0);

		const serverLatest =
			serverData.attempts.length > 0
				? new Date(Math.max(...serverData.attempts.map((a) => new Date(a.startDate).getTime())))
				: new Date(0);

		if (localLatest > serverLatest) {
			// Local data is newer, backup it
			await backupSmokeFreeData(localData);
			return { action: 'backed_up', data: localData };
		} else {
			// Server data is newer or equal, return it for client to use
			return { action: 'use_server', data: serverData };
		}
	}
);
