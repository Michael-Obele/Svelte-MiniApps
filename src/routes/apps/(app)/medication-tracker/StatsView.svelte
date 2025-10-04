<script lang="ts">
	import { TrendingUp, Activity, CheckCircle2, XCircle, AlertCircle } from '@lucide/svelte';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/card';
	import { Badge } from '@/ui/badge';

	import type { TreatmentSession, MedicationStats } from './states.svelte';
	import * as medState from './states.svelte';

	// Props
	let { session, stats } = $props<{
		session: TreatmentSession;
		stats: MedicationStats | null;
	}>();

	// Calculate per-medication stats
	let medicationStats = $derived(
		session.medications.map((med: any) => ({
			medication: med,
			stats: medState.calculateStats(session.id, med.id)
		}))
	);

	// Get adherence color
	function getAdherenceColor(rate: number): string {
		if (rate >= 90) return 'text-green-600 dark:text-green-400';
		if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	}

	function getAdherenceBg(rate: number): string {
		if (rate >= 90)
			return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
		if (rate >= 70)
			return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
		return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
	}
</script>

<div class="mt-6 space-y-6">
	<!-- Overall Statistics -->
	{#if stats}
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<TrendingUp class="size-5" />
					Overall Statistics
				</CardTitle>
				<CardDescription>Your medication adherence across all medications</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Doses</p>
						<p class="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDoses}</p>
					</div>

					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Taken</p>
						<p class="text-3xl font-bold text-green-600 dark:text-green-400">{stats.takenDoses}</p>
						<p class="text-xs text-gray-500">
							{stats.totalDoses > 0 ? ((stats.takenDoses / stats.totalDoses) * 100).toFixed(1) : 0}%
						</p>
					</div>

					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Skipped</p>
						<p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
							{stats.skippedDoses}
						</p>
						<p class="text-xs text-gray-500">
							{stats.totalDoses > 0
								? ((stats.skippedDoses / stats.totalDoses) * 100).toFixed(1)
								: 0}%
						</p>
					</div>

					<div class="space-y-2">
						<p class="text-sm font-medium text-gray-600 dark:text-gray-400">Missed</p>
						<p class="text-3xl font-bold text-red-600 dark:text-red-400">{stats.missedDoses}</p>
						<p class="text-xs text-gray-500">
							{stats.totalDoses > 0
								? ((stats.missedDoses / stats.totalDoses) * 100).toFixed(1)
								: 0}%
						</p>
					</div>
				</div>

				<!-- Adherence Rate -->
				<div class="mt-6 rounded-lg p-6 {getAdherenceBg(stats.adherenceRate)}">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-sm font-medium text-gray-700 dark:text-gray-300">
								Overall Adherence Rate
							</p>
							<p class="text-4xl font-bold {getAdherenceColor(stats.adherenceRate)} mt-1">
								{stats.adherenceRate.toFixed(1)}%
							</p>
						</div>
						<Activity class="size-16 opacity-20" />
					</div>

					<div class="mt-4">
						<div class="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
							<div
								class="h-full {stats.adherenceRate >= 90
									? 'bg-green-500'
									: stats.adherenceRate >= 70
										? 'bg-yellow-500'
										: 'bg-red-500'}"
								style="width: {stats.adherenceRate}%"
							></div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Per-Medication Statistics -->
	<Card>
		<CardHeader>
			<CardTitle>Medication-Specific Statistics</CardTitle>
			<CardDescription>Track adherence for each medication individually</CardDescription>
		</CardHeader>
		<CardContent>
			{#if medicationStats.length === 0}
				<div class="py-8 text-center text-gray-500 dark:text-gray-400">
					<p>No medications added yet.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each medicationStats as { medication, stats }}
						<div class="rounded-lg border p-4 {getAdherenceBg(stats.adherenceRate)}">
							<div class="flex items-start justify-between">
								<div class="flex flex-1 items-start gap-3">
									<div
										class="mt-1 size-4 rounded-full"
										style="background-color: {medication.color}"
									></div>
									<div class="flex-1">
										<h4 class="font-semibold text-gray-900 dark:text-white">
											{medication.name}
										</h4>
										<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
											{medication.dosage} • {medication.frequency}
										</p>

										<!-- Mini stats -->
										<div class="mt-3 flex gap-4 text-sm">
											<div class="flex items-center gap-1">
												<CheckCircle2 class="size-4 text-green-600 dark:text-green-400" />
												<span class="text-gray-700 dark:text-gray-300">{stats.takenDoses}</span>
											</div>
											<div class="flex items-center gap-1">
												<XCircle class="size-4 text-yellow-600 dark:text-yellow-400" />
												<span class="text-gray-700 dark:text-gray-300">{stats.skippedDoses}</span>
											</div>
											<div class="flex items-center gap-1">
												<AlertCircle class="size-4 text-red-600 dark:text-red-400" />
												<span class="text-gray-700 dark:text-gray-300">{stats.missedDoses}</span>
											</div>
										</div>
									</div>
								</div>

								<div class="text-right">
									<div class="text-2xl font-bold {getAdherenceColor(stats.adherenceRate)}">
										{stats.adherenceRate.toFixed(1)}%
									</div>
									<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
										{stats.totalDoses} total doses
									</p>
								</div>
							</div>

							<!-- Progress bar -->
							<div class="mt-3">
								<div class="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-full {stats.adherenceRate >= 90
											? 'bg-green-500'
											: stats.adherenceRate >= 70
												? 'bg-yellow-500'
												: 'bg-red-500'}"
										style="width: {stats.adherenceRate}%"
									></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Recommendations -->
	{#if stats && stats.adherenceRate < 80}
		<Card class="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
			<CardContent class="pt-6">
				<div class="flex gap-3">
					<AlertCircle class="mt-0.5 size-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
					<div>
						<h4 class="mb-2 font-semibold text-gray-900 dark:text-white">Improve Your Adherence</h4>
						<ul class="space-y-1 text-sm text-gray-700 dark:text-gray-300">
							<li>• Set reminders on your phone for each medication time</li>
							<li>• Keep medications in a visible location</li>
							<li>• Use a pill organizer to prepare doses in advance</li>
							<li>• Link medication times to daily routines (meals, bedtime, etc.)</li>
						</ul>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
