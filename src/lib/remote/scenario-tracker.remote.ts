import { query, command, form } from '$app/server';
import { prisma } from '$lib/server/db';
import { getCurrentUser } from './auth.remote';
import * as v from 'valibot';

// ============================================================================
// TYPES - Matching the Prisma schema
// ============================================================================

interface ScenarioSettings {
	id: string;
	startDate: string;
	endDate: string;
	createdAt: string;
	updatedAt: string;
}

interface ScenarioActivity {
	id: string;
	optionId: string;
	date: string;
	description: string;
	timeSpent: number;
	progressMetric: string | null;
	status: string;
	notes: string | null;
	createdAt: string;
}

interface ScenarioOption {
	id: string;
	name: string;
	description: string | null;
	color: string;
	totalTimeSpent: number;
	progress: number;
	estimatedTimeToCompletion: string | null;
	allocation: number;
	createdAt: string;
	activities: ScenarioActivity[];
}

interface ScenarioTimelineEntryOption {
	optionId: string;
	timeAllocation: number;
}

interface ScenarioTimelineEntry {
	id: string;
	date: string;
	outcomes: string | null;
	adjustments: string | null;
	createdAt: string;
	options: ScenarioTimelineEntryOption[];
}

interface ScenarioRisk {
	id: string;
	optionId: string | null;
	description: string;
	severity: string;
	mitigation: string | null;
	createdAt: string;
}

// ============================================================================
// VALIBOT SCHEMAS
// ============================================================================

const SettingsSchema = v.object({
	startDate: v.pipe(v.string(), v.nonEmpty('Start date is required')),
	endDate: v.pipe(v.string(), v.nonEmpty('End date is required'))
});

const OptionSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty('Name is required')),
	description: v.optional(v.nullable(v.string())),
	color: v.optional(v.string(), 'bg-blue-500'),
	totalTimeSpent: v.optional(v.number(), 0),
	progress: v.optional(v.number(), 0),
	estimatedTimeToCompletion: v.optional(v.nullable(v.string())),
	allocation: v.optional(v.number(), 0)
});

const ActivitySchema = v.object({
	optionId: v.pipe(v.string(), v.nonEmpty('Option ID is required')),
	description: v.pipe(v.string(), v.nonEmpty('Description is required')),
	timeSpent: v.optional(v.number(), 0),
	progressMetric: v.optional(v.nullable(v.string())),
	status: v.optional(v.string(), 'planning'),
	notes: v.optional(v.nullable(v.string()))
});

const TimelineEntrySchema = v.object({
	date: v.optional(v.string()),
	outcomes: v.optional(v.nullable(v.string())),
	adjustments: v.optional(v.nullable(v.string())),
	optionsWorked: v.optional(v.array(v.string()), []),
	timeAllocation: v.optional(v.record(v.string(), v.number()), {})
});

const RiskSchema = v.object({
	description: v.pipe(v.string(), v.nonEmpty('Description is required')),
	severity: v.optional(v.string(), 'medium'),
	mitigation: v.optional(v.nullable(v.string())),
	optionId: v.optional(v.nullable(v.string()))
});

// ============================================================================
// QUERY FUNCTIONS - Read data from server
// ============================================================================

/**
 * Get all scenario tracker data for the current user
 */
export const getScenarioData = query(async () => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	const [settings, options, timelineEntries, risks] = await Promise.all([
		prisma.scenarioSettings.findUnique({ where: { userId: user.id } }),
		prisma.scenarioOption.findMany({
			where: { userId: user.id },
			include: { activities: { orderBy: { date: 'desc' } } },
			orderBy: { createdAt: 'asc' }
		}),
		prisma.scenarioTimelineEntry.findMany({
			where: { userId: user.id },
			include: { options: true },
			orderBy: { date: 'desc' }
		}),
		prisma.scenarioRisk.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'asc' }
		})
	]);

	return {
		settings: settings
			? {
					id: settings.id,
					startDate: settings.startDate.toISOString(),
					endDate: settings.endDate.toISOString(),
					createdAt: settings.createdAt.toISOString(),
					updatedAt: settings.updatedAt.toISOString()
				}
			: null,
		options: options.map((opt) => ({
			id: opt.id,
			name: opt.name,
			description: opt.description,
			color: opt.color,
			totalTimeSpent: opt.totalTimeSpent,
			progress: opt.progress,
			estimatedTimeToCompletion: opt.estimatedTimeToCompletion,
			allocation: opt.allocation,
			createdAt: opt.createdAt.toISOString(),
			activities: opt.activities.map((act) => ({
				id: act.id,
				optionId: act.optionId,
				date: act.date.toISOString(),
				description: act.description,
				timeSpent: act.timeSpent,
				progressMetric: act.progressMetric,
				status: act.status,
				notes: act.notes,
				createdAt: act.createdAt.toISOString()
			}))
		})),
		timelineEntries: timelineEntries.map((entry) => ({
			id: entry.id,
			date: entry.date.toISOString(),
			outcomes: entry.outcomes,
			adjustments: entry.adjustments,
			createdAt: entry.createdAt.toISOString(),
			optionsWorked: entry.options.map((o) => o.optionId),
			timeAllocation: Object.fromEntries(entry.options.map((o) => [o.optionId, o.timeAllocation]))
		})),
		risks: risks.map((risk) => ({
			id: risk.id,
			optionId: risk.optionId,
			description: risk.description,
			severity: risk.severity,
			mitigation: risk.mitigation,
			createdAt: risk.createdAt.toISOString()
		}))
	};
});

// ============================================================================
// SETTINGS COMMANDS
// ============================================================================

/**
 * Update or create scenario settings
 */
export const updateScenarioSettings = command(SettingsSchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	const settings = await prisma.scenarioSettings.upsert({
		where: { userId: user.id },
		update: {
			startDate: new Date(data.startDate),
			endDate: new Date(data.endDate)
		},
		create: {
			userId: user.id,
			startDate: new Date(data.startDate),
			endDate: new Date(data.endDate)
		}
	});

	await getScenarioData().refresh();

	return {
		success: true,
		settings: {
			id: settings.id,
			startDate: settings.startDate.toISOString(),
			endDate: settings.endDate.toISOString(),
			createdAt: settings.createdAt.toISOString(),
			updatedAt: settings.updatedAt.toISOString()
		}
	};
});

// ============================================================================
// OPTION COMMANDS
// ============================================================================

/**
 * Add a new scenario option
 */
export const addScenarioOption = command(OptionSchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	const option = await prisma.scenarioOption.create({
		data: {
			userId: user.id,
			name: data.name,
			description: data.description || null,
			color: data.color || 'bg-blue-500',
			totalTimeSpent: data.totalTimeSpent || 0,
			progress: data.progress || 0,
			estimatedTimeToCompletion: data.estimatedTimeToCompletion || null,
			allocation: data.allocation || 0
		}
	});

	await getScenarioData().refresh();

	return {
		success: true,
		option: {
			id: option.id,
			name: option.name,
			description: option.description,
			color: option.color,
			totalTimeSpent: option.totalTimeSpent,
			progress: option.progress,
			estimatedTimeToCompletion: option.estimatedTimeToCompletion,
			allocation: option.allocation,
			createdAt: option.createdAt.toISOString(),
			activities: []
		}
	};
});

/**
 * Update an existing scenario option
 */
export const updateScenarioOption = command(
	v.object({
		id: v.pipe(v.string(), v.nonEmpty('Option ID is required')),
		name: v.optional(v.string()),
		description: v.optional(v.nullable(v.string())),
		color: v.optional(v.string()),
		totalTimeSpent: v.optional(v.number()),
		progress: v.optional(v.number()),
		estimatedTimeToCompletion: v.optional(v.nullable(v.string())),
		allocation: v.optional(v.number())
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Verify ownership
		const existing = await prisma.scenarioOption.findFirst({
			where: { id: data.id, userId: user.id }
		});

		if (!existing) {
			throw new Error('Option not found or you do not have permission to update it');
		}

		const updateData: Record<string, unknown> = {};
		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.color !== undefined) updateData.color = data.color;
		if (data.totalTimeSpent !== undefined) updateData.totalTimeSpent = data.totalTimeSpent;
		if (data.progress !== undefined) updateData.progress = data.progress;
		if (data.estimatedTimeToCompletion !== undefined)
			updateData.estimatedTimeToCompletion = data.estimatedTimeToCompletion;
		if (data.allocation !== undefined) updateData.allocation = data.allocation;

		const option = await prisma.scenarioOption.update({
			where: { id: data.id },
			data: updateData
		});

		await getScenarioData().refresh();

		return {
			success: true,
			option: {
				id: option.id,
				name: option.name,
				description: option.description,
				color: option.color,
				totalTimeSpent: option.totalTimeSpent,
				progress: option.progress,
				estimatedTimeToCompletion: option.estimatedTimeToCompletion,
				allocation: option.allocation,
				createdAt: option.createdAt.toISOString()
			}
		};
	}
);

/**
 * Delete a scenario option and its activities
 */
export const deleteScenarioOption = command(v.string(), async (optionId) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	// Verify ownership
	const existing = await prisma.scenarioOption.findFirst({
		where: { id: optionId, userId: user.id }
	});

	if (!existing) {
		throw new Error('Option not found or you do not have permission to delete it');
	}

	// Delete cascades via Prisma schema relations
	await prisma.scenarioOption.delete({
		where: { id: optionId }
	});

	await getScenarioData().refresh();

	return { success: true, optionId };
});

// ============================================================================
// ACTIVITY COMMANDS
// ============================================================================

/**
 * Add a new activity to an option
 */
export const addScenarioActivity = command(ActivitySchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	// Verify option ownership
	const option = await prisma.scenarioOption.findFirst({
		where: { id: data.optionId, userId: user.id }
	});

	if (!option) {
		throw new Error('Option not found or you do not have permission to add activities to it');
	}

	const activity = await prisma.scenarioActivity.create({
		data: {
			optionId: data.optionId,
			description: data.description,
			timeSpent: data.timeSpent || 0,
			progressMetric: data.progressMetric || null,
			status: data.status || 'planning',
			notes: data.notes || null
		}
	});

	// Update the option's total time spent
	const totalTime = await prisma.scenarioActivity.aggregate({
		where: { optionId: data.optionId },
		_sum: { timeSpent: true }
	});

	await prisma.scenarioOption.update({
		where: { id: data.optionId },
		data: { totalTimeSpent: totalTime._sum.timeSpent || 0 }
	});

	await getScenarioData().refresh();

	return {
		success: true,
		activity: {
			id: activity.id,
			optionId: activity.optionId,
			date: activity.date.toISOString(),
			description: activity.description,
			timeSpent: activity.timeSpent,
			progressMetric: activity.progressMetric,
			status: activity.status,
			notes: activity.notes,
			createdAt: activity.createdAt.toISOString()
		}
	};
});

/**
 * Update an existing activity
 */
export const updateScenarioActivity = command(
	v.object({
		id: v.pipe(v.string(), v.nonEmpty('Activity ID is required')),
		description: v.optional(v.string()),
		timeSpent: v.optional(v.number()),
		progressMetric: v.optional(v.nullable(v.string())),
		status: v.optional(v.string()),
		notes: v.optional(v.nullable(v.string()))
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Verify ownership through option
		const existing = await prisma.scenarioActivity.findFirst({
			where: { id: data.id },
			include: { option: true }
		});

		if (!existing || existing.option.userId !== user.id) {
			throw new Error('Activity not found or you do not have permission to update it');
		}

		const updateData: Record<string, unknown> = {};
		if (data.description !== undefined) updateData.description = data.description;
		if (data.timeSpent !== undefined) updateData.timeSpent = data.timeSpent;
		if (data.progressMetric !== undefined) updateData.progressMetric = data.progressMetric;
		if (data.status !== undefined) updateData.status = data.status;
		if (data.notes !== undefined) updateData.notes = data.notes;

		const activity = await prisma.scenarioActivity.update({
			where: { id: data.id },
			data: updateData
		});

		// Update the option's total time spent
		const totalTime = await prisma.scenarioActivity.aggregate({
			where: { optionId: existing.optionId },
			_sum: { timeSpent: true }
		});

		await prisma.scenarioOption.update({
			where: { id: existing.optionId },
			data: { totalTimeSpent: totalTime._sum.timeSpent || 0 }
		});

		await getScenarioData().refresh();

		return {
			success: true,
			activity: {
				id: activity.id,
				optionId: activity.optionId,
				date: activity.date.toISOString(),
				description: activity.description,
				timeSpent: activity.timeSpent,
				progressMetric: activity.progressMetric,
				status: activity.status,
				notes: activity.notes,
				createdAt: activity.createdAt.toISOString()
			}
		};
	}
);

/**
 * Delete an activity
 */
export const deleteScenarioActivity = command(v.string(), async (activityId) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	// Verify ownership through option
	const existing = await prisma.scenarioActivity.findFirst({
		where: { id: activityId },
		include: { option: true }
	});

	if (!existing || existing.option.userId !== user.id) {
		throw new Error('Activity not found or you do not have permission to delete it');
	}

	const optionId = existing.optionId;

	await prisma.scenarioActivity.delete({
		where: { id: activityId }
	});

	// Update the option's total time spent
	const totalTime = await prisma.scenarioActivity.aggregate({
		where: { optionId },
		_sum: { timeSpent: true }
	});

	await prisma.scenarioOption.update({
		where: { id: optionId },
		data: { totalTimeSpent: totalTime._sum.timeSpent || 0 }
	});

	await getScenarioData().refresh();

	return { success: true, activityId };
});

// ============================================================================
// TIMELINE ENTRY COMMANDS
// ============================================================================

/**
 * Add a new timeline entry
 */
export const addScenarioTimelineEntry = command(TimelineEntrySchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	const entry = await prisma.scenarioTimelineEntry.create({
		data: {
			userId: user.id,
			date: data.date ? new Date(data.date) : new Date(),
			outcomes: data.outcomes || null,
			adjustments: data.adjustments || null
		}
	});

	// Create option associations with time allocations
	const optionsWorked = data.optionsWorked || [];
	const timeAllocation = data.timeAllocation || {};

	for (const optionId of optionsWorked) {
		// Verify option ownership
		const option = await prisma.scenarioOption.findFirst({
			where: { id: optionId, userId: user.id }
		});

		if (option) {
			await prisma.scenarioTimelineEntryOption.create({
				data: {
					timelineEntryId: entry.id,
					optionId: optionId,
					timeAllocation: timeAllocation[optionId] || 0
				}
			});
		}
	}

	await getScenarioData().refresh();

	return {
		success: true,
		entry: {
			id: entry.id,
			date: entry.date.toISOString(),
			outcomes: entry.outcomes,
			adjustments: entry.adjustments,
			createdAt: entry.createdAt.toISOString(),
			optionsWorked,
			timeAllocation
		}
	};
});

/**
 * Update an existing timeline entry
 */
export const updateScenarioTimelineEntry = command(
	v.object({
		id: v.pipe(v.string(), v.nonEmpty('Entry ID is required')),
		date: v.optional(v.string()),
		outcomes: v.optional(v.nullable(v.string())),
		adjustments: v.optional(v.nullable(v.string())),
		optionsWorked: v.optional(v.array(v.string())),
		timeAllocation: v.optional(v.record(v.string(), v.number()))
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Verify ownership
		const existing = await prisma.scenarioTimelineEntry.findFirst({
			where: { id: data.id, userId: user.id }
		});

		if (!existing) {
			throw new Error('Timeline entry not found or you do not have permission to update it');
		}

		const updateData: Record<string, unknown> = {};
		if (data.date !== undefined) updateData.date = new Date(data.date);
		if (data.outcomes !== undefined) updateData.outcomes = data.outcomes;
		if (data.adjustments !== undefined) updateData.adjustments = data.adjustments;

		const entry = await prisma.scenarioTimelineEntry.update({
			where: { id: data.id },
			data: updateData
		});

		// Update option associations if provided
		if (data.optionsWorked !== undefined || data.timeAllocation !== undefined) {
			// Delete existing associations
			await prisma.scenarioTimelineEntryOption.deleteMany({
				where: { timelineEntryId: data.id }
			});

			// Create new associations
			const optionsWorked = data.optionsWorked || [];
			const timeAllocation = data.timeAllocation || {};

			for (const optionId of optionsWorked) {
				// Verify option ownership
				const option = await prisma.scenarioOption.findFirst({
					where: { id: optionId, userId: user.id }
				});

				if (option) {
					await prisma.scenarioTimelineEntryOption.create({
						data: {
							timelineEntryId: data.id,
							optionId: optionId,
							timeAllocation: timeAllocation[optionId] || 0
						}
					});
				}
			}
		}

		await getScenarioData().refresh();

		return {
			success: true,
			entry: {
				id: entry.id,
				date: entry.date.toISOString(),
				outcomes: entry.outcomes,
				adjustments: entry.adjustments,
				createdAt: entry.createdAt.toISOString()
			}
		};
	}
);

/**
 * Delete a timeline entry
 */
export const deleteScenarioTimelineEntry = command(v.string(), async (entryId) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	// Verify ownership
	const existing = await prisma.scenarioTimelineEntry.findFirst({
		where: { id: entryId, userId: user.id }
	});

	if (!existing) {
		throw new Error('Timeline entry not found or you do not have permission to delete it');
	}

	// Cascade delete handles the ScenarioTimelineEntryOption records
	await prisma.scenarioTimelineEntry.delete({
		where: { id: entryId }
	});

	await getScenarioData().refresh();

	return { success: true, entryId };
});

// ============================================================================
// RISK COMMANDS
// ============================================================================

/**
 * Add a new risk
 */
export const addScenarioRisk = command(RiskSchema, async (data) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	// Verify option ownership if optionId is provided
	if (data.optionId) {
		const option = await prisma.scenarioOption.findFirst({
			where: { id: data.optionId, userId: user.id }
		});

		if (!option) {
			throw new Error('Option not found or you do not have permission to add risks to it');
		}
	}

	const risk = await prisma.scenarioRisk.create({
		data: {
			userId: user.id,
			optionId: data.optionId || null,
			description: data.description,
			severity: data.severity || 'medium',
			mitigation: data.mitigation || null
		}
	});

	await getScenarioData().refresh();

	return {
		success: true,
		risk: {
			id: risk.id,
			optionId: risk.optionId,
			description: risk.description,
			severity: risk.severity,
			mitigation: risk.mitigation,
			createdAt: risk.createdAt.toISOString()
		}
	};
});

/**
 * Update an existing risk
 */
export const updateScenarioRisk = command(
	v.object({
		id: v.pipe(v.string(), v.nonEmpty('Risk ID is required')),
		description: v.optional(v.string()),
		severity: v.optional(v.string()),
		mitigation: v.optional(v.nullable(v.string())),
		optionId: v.optional(v.nullable(v.string()))
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Verify ownership
		const existing = await prisma.scenarioRisk.findFirst({
			where: { id: data.id, userId: user.id }
		});

		if (!existing) {
			throw new Error('Risk not found or you do not have permission to update it');
		}

		// Verify new option ownership if optionId is being changed
		if (data.optionId !== undefined && data.optionId !== null) {
			const option = await prisma.scenarioOption.findFirst({
				where: { id: data.optionId, userId: user.id }
			});

			if (!option) {
				throw new Error('Option not found or you do not have permission to link risks to it');
			}
		}

		const updateData: Record<string, unknown> = {};
		if (data.description !== undefined) updateData.description = data.description;
		if (data.severity !== undefined) updateData.severity = data.severity;
		if (data.mitigation !== undefined) updateData.mitigation = data.mitigation;
		if (data.optionId !== undefined) updateData.optionId = data.optionId;

		const risk = await prisma.scenarioRisk.update({
			where: { id: data.id },
			data: updateData
		});

		await getScenarioData().refresh();

		return {
			success: true,
			risk: {
				id: risk.id,
				optionId: risk.optionId,
				description: risk.description,
				severity: risk.severity,
				mitigation: risk.mitigation,
				createdAt: risk.createdAt.toISOString()
			}
		};
	}
);

/**
 * Delete a risk
 */
export const deleteScenarioRisk = command(v.string(), async (riskId) => {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error('User not authenticated');
	}

	// Verify ownership
	const existing = await prisma.scenarioRisk.findFirst({
		where: { id: riskId, userId: user.id }
	});

	if (!existing) {
		throw new Error('Risk not found or you do not have permission to delete it');
	}

	await prisma.scenarioRisk.delete({
		where: { id: riskId }
	});

	await getScenarioData().refresh();

	return { success: true, riskId };
});

// ============================================================================
// INITIALIZATION COMMAND
// ============================================================================

/**
 * Initialize default data for scenario tracker
 */
export const initializeScenarioDefaults = command(
	v.object({
		startDate: v.pipe(v.string(), v.nonEmpty('Start date is required')),
		endDate: v.pipe(v.string(), v.nonEmpty('End date is required'))
	}),
	async (data) => {
		const user = await getCurrentUser();

		if (!user) {
			throw new Error('User not authenticated');
		}

		// Check if user already has data
		const existingSettings = await prisma.scenarioSettings.findUnique({
			where: { userId: user.id }
		});

		if (existingSettings) {
			return { success: true, message: 'Data already initialized' };
		}

		// Create settings
		await prisma.scenarioSettings.create({
			data: {
				userId: user.id,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate)
			}
		});

		// Create default options
		const defaultOptions = [
			{
				name: 'Freelance Software Dev',
				description: 'Passion job; slow growth but paying out. Scale via international clients.',
				color: 'bg-blue-500',
				allocation: 60,
				estimatedTimeToCompletion: '2-4 years'
			},
			{
				name: 'Company Job',
				description: 'Promised role; hate lifestyle/exams but certs enable exit.',
				color: 'bg-amber-500',
				allocation: 30,
				estimatedTimeToCompletion: '3-5 years'
			},
			{
				name: 'Luck-Based',
				description: "Fast payouts but unreliable; use for cash boosts. Don't double down.",
				color: 'bg-purple-500',
				allocation: 10,
				estimatedTimeToCompletion: '1-3 years'
			}
		];

		for (const opt of defaultOptions) {
			await prisma.scenarioOption.create({
				data: {
					userId: user.id,
					...opt
				}
			});
		}

		// Create default risks
		const defaultRisks = [
			{
				description: 'Market downturn affecting freelance demand',
				severity: 'high',
				mitigation: 'Diversify client base across industries and geographies'
			},
			{
				description: 'Burnout from maintaining multiple tracks',
				severity: 'medium',
				mitigation: 'Regular check-ins and strict time boundaries'
			},
			{
				description: 'Technology skills becoming obsolete',
				severity: 'medium',
				mitigation: 'Continuous learning and certification program'
			}
		];

		for (const risk of defaultRisks) {
			await prisma.scenarioRisk.create({
				data: {
					userId: user.id,
					...risk
				}
			});
		}

		await getScenarioData().refresh();

		return { success: true, message: 'Default data initialized successfully' };
	}
);
