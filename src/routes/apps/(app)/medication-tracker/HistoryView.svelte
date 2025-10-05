<script lang="ts">
	import { slide } from 'svelte/transition';
	import { CheckCircle2, XCircle, AlertCircle, Clock, Calendar, RotateCcw } from '@lucide/svelte';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { Button } from '@/ui/button';
	import { toast } from 'svelte-sonner';
	import type { TreatmentSession, MedicationLog, Medication } from './states.svelte';
	import { updateLog } from './states.svelte';

	// Props
	let {
		session,
		logs,
		getMedication,
		onDataChanged
	}: {
		session: TreatmentSession;
		logs: MedicationLog[];
		getMedication: (id: string) => Medication | undefined;
		onDataChanged?: () => void;
	} = $props();

	// Format date for display (e.g., "Mon, Jan 15, 2024")
	function formatDate(isoString: string): string {
		return new Date(isoString).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Format time for display (e.g., "2:30 PM")
	function formatTime(isoString: string): string {
		return new Date(isoString).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	// Get date key for grouping (YYYY-MM-DD)
	function getDateKey(isoString: string): string {
		const date = new Date(isoString);
		return date.toISOString().split('T')[0];
	}

	// Group logs by date and sort
	let groupedLogs = $derived.by(() => {
		// Create a map to group logs by date
		const grouped = new Map<string, MedicationLog[]>();

		// Group all logs by their date
		logs.forEach((log) => {
			const dateKey = getDateKey(log.scheduledTime);
			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, []);
			}
			grouped.get(dateKey)!.push(log);
		});

		// Convert to array and sort by date (oldest first)
		const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
			return new Date(a[0]).getTime() - new Date(b[0]).getTime();
		});

		// Sort logs within each day by scheduled time
		sortedEntries.forEach(([_, dayLogs]) => {
			dayLogs.sort((a, b) => {
				return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
			});
		});

		return sortedEntries;
	});

	// Calculate daily stats
	function getDailyStats(dayLogs: MedicationLog[]) {
		const taken = dayLogs.filter((log) => log.status === 'taken').length;
		const skipped = dayLogs.filter((log) => log.status === 'skipped').length;
		const missed = dayLogs.filter((log) => log.status === 'missed').length;
		const pending = dayLogs.filter((log) => log.status === 'pending').length;
		const total = dayLogs.length;
		const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

		return { taken, skipped, missed, pending, total, adherence };
	}

	// Get adherence color
	function getAdherenceColor(rate: number): string {
		if (rate >= 90) return 'text-green-600 dark:text-green-400';
		if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	}

	// Check if date is today
	function isToday(dateKey: string): boolean {
		const today = new Date().toISOString().split('T')[0];
		return dateKey === today;
	}

	// Check if date is yesterday
	function isYesterday(dateKey: string): boolean {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		return dateKey === yesterday.toISOString().split('T')[0];
	}

	// Get relative date label
	function getDateLabel(dateKey: string): string {
		if (isToday(dateKey)) return 'Today';
		if (isYesterday(dateKey)) return 'Yesterday';
		return formatDate(dateKey);
	}

	// Undo a medication log (reset to pending)
	function undoLog(logId: string) {
		updateLog(logId, {
			status: 'pending',
			actualTime: undefined,
			notes: undefined
		});
		onDataChanged?.();
		toast.success('Medication status reset to pending');
	}
</script>

<Card class="mt-6">
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<Calendar class="size-5" />
			Medication History
		</CardTitle>
		<CardDescription>
			View your medication schedule grouped by day for {session.name}
		</CardDescription>
	</CardHeader>
	<CardContent>
		{#if groupedLogs.length === 0}
			<div class="py-12 text-center">
				<Clock class="mx-auto mb-4 size-16 text-gray-400" />
				<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">No History Yet</h3>
				<p class="text-gray-600 dark:text-gray-400">
					Your medication history will appear here once you start taking medications
				</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each groupedLogs as [dateKey, dayLogs]}
					{@const stats = getDailyStats(dayLogs)}
					<div class="space-y-3" transition:slide>
						<!-- Date Header with Stats -->
						<div
							class="sticky top-0 z-10 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/95 p-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95"
						>
							<div>
								<h3 class="font-semibold text-gray-900 dark:text-white">
									{getDateLabel(dateKey)}
								</h3>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									{stats.total}
									{stats.total === 1 ? 'medication' : 'medications'} scheduled
								</p>
							</div>
							<div class="text-right">
								<div class="text-lg font-bold {getAdherenceColor(stats.adherence)}">
									{stats.adherence}%
								</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">adherence</div>
							</div>
						</div>

						<!-- Daily Summary Stats -->
						<div class="grid grid-cols-4 gap-2">
							{#if stats.taken > 0}
								<div
									class="rounded-md border border-green-200 bg-green-50 p-2 text-center dark:border-green-800 dark:bg-green-900/20"
								>
									<div class="text-lg font-bold text-green-600 dark:text-green-400">
										{stats.taken}
									</div>
									<div class="text-xs text-green-700 dark:text-green-300">Taken</div>
								</div>
							{/if}
							{#if stats.skipped > 0}
								<div
									class="rounded-md border border-yellow-200 bg-yellow-50 p-2 text-center dark:border-yellow-800 dark:bg-yellow-900/20"
								>
									<div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">
										{stats.skipped}
									</div>
									<div class="text-xs text-yellow-700 dark:text-yellow-300">Skipped</div>
								</div>
							{/if}
							{#if stats.missed > 0}
								<div
									class="rounded-md border border-red-200 bg-red-50 p-2 text-center dark:border-red-800 dark:bg-red-900/20"
								>
									<div class="text-lg font-bold text-red-600 dark:text-red-400">
										{stats.missed}
									</div>
									<div class="text-xs text-red-700 dark:text-red-300">Missed</div>
								</div>
							{/if}
							{#if stats.pending > 0}
								<div
									class="rounded-md border border-gray-200 bg-gray-50 p-2 text-center dark:border-gray-700 dark:bg-gray-800"
								>
									<div class="text-lg font-bold text-gray-600 dark:text-gray-400">
										{stats.pending}
									</div>
									<div class="text-xs text-gray-700 dark:text-gray-300">Pending</div>
								</div>
							{/if}
						</div>

						<!-- Medications for this day -->
						<div class="space-y-2">
							{#each dayLogs as log}
								{@const med = getMedication(log.medicationId)}
								{#if med}
									<div
										class="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
										transition:slide
									>
										<div class="flex items-center gap-3">
											<div
												class="size-3 flex-shrink-0 rounded-full"
												style="background-color: {med.color}"
											></div>
											<div>
												<p class="font-medium text-gray-900 dark:text-white">
													{med.name}
												</p>
												<div
													class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
												>
													<Clock class="size-3" />
													<span>{formatTime(log.scheduledTime)}</span>
													{#if med.dosage}
														<span class="text-gray-400">•</span>
														<span>{med.dosage}</span>
													{/if}
												</div>
												{#if log.notes}
													<p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
														{log.notes}
													</p>
												{/if}
											</div>
										</div>
										<div class="flex items-center gap-2">
											{#if log.status === 'taken'}
												<Badge variant="default" class="bg-green-500">
													<CheckCircle2 class="mr-1 size-3" />
													<span class="hidden sm:inline">Taken</span>
												</Badge>
												{#if log.actualTime && log.actualTime !== log.scheduledTime}
													<span class="text-xs text-gray-500 dark:text-gray-400">
														at {formatTime(log.actualTime)}
													</span>
												{/if}
												<Button
													size="sm"
													variant="ghost"
													onclick={() => undoLog(log.id)}
													class="ml-2 h-6 px-2 text-xs"
												>
													<RotateCcw class="mr-1 size-3" />
													<span class="hidden sm:inline">Undo</span>
												</Button>
											{:else if log.status === 'skipped'}
												<Badge variant="secondary">
													<XCircle class="mr-1 size-3" />
													<span class="hidden sm:inline">Skipped</span>
												</Badge>
												<Button
													size="sm"
													variant="ghost"
													onclick={() => undoLog(log.id)}
													class="ml-2 h-6 px-2 text-xs"
												>
													<RotateCcw class="mr-1 size-3" />
													<span class="hidden sm:inline">Undo</span>
												</Button>
											{:else if log.status === 'missed'}
												<Badge variant="destructive">
													<AlertCircle class="mr-1 size-3" />
													<span class="hidden sm:inline">Missed</span>
												</Badge>
											{:else}
												<Badge variant="outline">
													<Clock class="mr-1 size-3" />
													<span class="hidden sm:inline">Pending</span>
												</Badge>
											{/if}
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
