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

interface UserSettings {
	cigarettesPerDay: number;
	pricePerPack: number;
	cigarettesPerPack: number;
	currency: string;
	motivationalGoals: string[];
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

const UserSettingsSchema = v.object({
	cigarettesPerDay: v.number(),
	pricePerPack: v.number(),
	cigarettesPerPack: v.number(),
	currency: v.string(),
	motivationalGoals: v.array(v.string())
});

const BackupDataSchema = v.object({
	attempts: v.array(SmokingAttemptSchema),
	cravings: v.array(CravingLogSchema),
	settings: UserSettingsSchema
});

// Query to load data from server
export const loadSmokeFreeData = query(async () => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	console.log(`🔍 Loading smoke-free tracker data for user: ${user.id}`);

	const [attempts, cravings, settings] = await Promise.all([
		prisma.smokingAttempt.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		}),
		prisma.cravingLog.findMany({
			where: { attempt: { userId: user.id } },
			orderBy: { timestamp: 'desc' }
		}),
		prisma.smokeFreeSettings.findUnique({
			where: { userId: user.id }
		})
	]);

	console.log(
		`📊 Loaded ${attempts.length} attempts, ${cravings.length} craving logs, and settings for user ${user.id}`
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
		})),
		settings: settings
			? {
					cigarettesPerDay: settings.cigarettesPerDay,
					pricePerPack: settings.pricePerPack,
					cigarettesPerPack: settings.cigarettesPerPack,
					currency: settings.currency,
					motivationalGoals: settings.motivationalGoals
				}
			: {
					cigarettesPerDay: 20,
					pricePerPack: 10,
					cigarettesPerPack: 20,
					currency: '$',
					motivationalGoals: []
				}
	};
});

// Command to backup data to server
export const backupSmokeFreeData = command(
	v.object({
		attempts: v.array(SmokingAttemptSchema),
		cravings: v.array(CravingLogSchema),
		settings: UserSettingsSchema
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(
			`💾 Backing up ${data.attempts.length} attempts, ${data.cravings.length} cravings, and settings for user ${user.id}`
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

			// Upsert settings
			await tx.smokeFreeSettings.upsert({
				where: { userId: user.id },
				update: {
					cigarettesPerDay: data.settings.cigarettesPerDay,
					pricePerPack: data.settings.pricePerPack,
					cigarettesPerPack: data.settings.cigarettesPerPack,
					currency: data.settings.currency,
					motivationalGoals: data.settings.motivationalGoals
				},
				create: {
					userId: user.id,
					cigarettesPerDay: data.settings.cigarettesPerDay,
					pricePerPack: data.settings.pricePerPack,
					cigarettesPerPack: data.settings.cigarettesPerPack,
					currency: data.settings.currency,
					motivationalGoals: data.settings.motivationalGoals
				}
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
		cravings: v.array(CravingLogSchema),
		settings: UserSettingsSchema
	}),
	async (localData) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		console.log(`🔄 Syncing smoke-free tracker data for user ${user.id}`);

		// Load server data
		const serverData = await loadSmokeFreeData();

		// Improved sync strategy:
		// - If local data has active attempts, prefer local (user is actively using the app)
		// - If local has no active attempts but server does, use server
		// - Otherwise, compare modification times

		const localHasActiveAttempts = localData.attempts.some((a: SmokingAttempt) => a.isActive);
		const serverHasActiveAttempts = serverData.attempts.some((a: SmokingAttempt) => a.isActive);

		if (localHasActiveAttempts && !serverHasActiveAttempts) {
			// Local has active attempts, server doesn't - backup local
			await backupSmokeFreeData(localData);
			return { action: 'backed_up', data: localData };
		} else if (!localHasActiveAttempts && serverHasActiveAttempts) {
			// Server has active attempts, local doesn't - use server
			return { action: 'use_server', data: serverData };
		} else {
			// Both have similar attempt states, compare by latest modification
			const localLatest =
				localData.attempts.length > 0
					? new Date(
							Math.max(
								...localData.attempts.map((a: SmokingAttempt) => new Date(a.startDate).getTime())
							)
						)
					: new Date(0);

			const serverLatest =
				serverData.attempts.length > 0
					? new Date(
							Math.max(
								...serverData.attempts.map((a: SmokingAttempt) => new Date(a.startDate).getTime())
							)
						)
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
	}
);
