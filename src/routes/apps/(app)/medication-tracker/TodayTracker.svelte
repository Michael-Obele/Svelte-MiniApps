<script lang="ts">
	import { CheckCircle2, XCircle, Clock, AlertCircle, StickyNote } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import * as Dialog from '@/ui/dialog';
	import { Textarea } from '@/ui/textarea';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';

	import type { TreatmentSession, Medication, MedicationLog } from './states.svelte';
	import { updateLog } from './states.svelte';

	// Props
	let { todayLogs, activeSession, onMarkTaken, onMarkSkipped, getMedication, formatTime, isPast } =
		$props<{
			todayLogs: MedicationLog[];
			activeSession: TreatmentSession;
			onMarkTaken: (logId: string) => void;
			onMarkSkipped: (logId: string, notes?: string) => void;
			getMedication: (medicationId: string) => Medication | undefined;
			formatTime: (isoString: string) => string;
			isPast: (isoString: string) => boolean;
		}>();

	// State
	let showSkipDialog = $state(false);
	let skipNotes = $state('');
	let currentLog = $state<MedicationLog | null>(null);
	let showEditTimeDialog = $state(false);
	let editTimeLog = $state<MedicationLog | null>(null);
	let editedTime = $state('');

	function openSkipDialog(log: MedicationLog) {
		currentLog = log;
		skipNotes = '';
		showSkipDialog = true;
	}

	function confirmSkip() {
		if (currentLog) {
			onMarkSkipped(currentLog.id, skipNotes.trim() || undefined);
			showSkipDialog = false;
			currentLog = null;
			skipNotes = '';
		}
	}

	function openEditTimeDialog(log: MedicationLog) {
		editTimeLog = log;
		// Get current time or use scheduled time
		const timeToEdit = log.actualTime || log.scheduledTime;
		const date = new Date(timeToEdit);
		editedTime = date.toTimeString().slice(0, 5); // HH:MM format
		showEditTimeDialog = true;
	}

	function saveEditedTime() {
		if (!editTimeLog || !editedTime) return;

		// Parse the time and create a new date with today's date
		const [hours, minutes] = editedTime.split(':');
		const now = new Date(editTimeLog.scheduledTime);
		now.setHours(parseInt(hours), parseInt(minutes), 0, 0);

		// Update local state directly
		updateLog(editTimeLog.id, {
			actualTime: now.toISOString()
		});

		toast.success('Time updated successfully');
		showEditTimeDialog = false;
		editTimeLog = null;
		editedTime = '';
	}

	// Group logs by time
	let groupedLogs = $derived(
		todayLogs.reduce(
			(acc: Record<string, MedicationLog[]>, log: MedicationLog) => {
				const time = formatTime(log.scheduledTime);
				if (!acc[time]) acc[time] = [];
				acc[time].push(log);
				return acc;
			},
			{} as Record<string, MedicationLog[]>
		)
	);
</script>

<Card>
	<CardHeader>
		<CardTitle>Today's Schedule</CardTitle>
	</CardHeader>
	<CardContent>
		{#if todayLogs.length === 0}
			<div class="py-8 text-center text-gray-500 dark:text-gray-400">
				<Clock class="mx-auto mb-3 size-12 opacity-50" />
				<p>No scheduled medications for today.</p>
				<p class="mt-1 text-sm">Add medications and create a schedule to get started.</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each Object.entries(groupedLogs) as [time, logs]}
					{@const typedLogs = logs as MedicationLog[]}
					<div class="space-y-3" transition:slide>
						<div
							class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							<Clock class="size-4" />
							{time}
						</div>

						{#each typedLogs as log (log.id)}
							{@const med = getMedication(log.medicationId)}
							{#if med}
								<div
									class="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 {log.status ===
									'pending'
										? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
										: log.status === 'taken'
											? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
											: log.status === 'skipped'
												? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
												: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}"
								>
									<div class="flex flex-1 items-center gap-3 sm:gap-4">
										<div class="size-3 rounded-full" style="background-color: {med.color}"></div>
										<div class="flex-1">
											<p class="font-semibold text-gray-900 dark:text-white">{med.name}</p>
											<p class="text-sm text-gray-600 dark:text-gray-400">{med.dosage}</p>
											{#if log.notes}
												<p
													class="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500"
												>
													<StickyNote class="size-3" />
													{log.notes}
												</p>
											{/if}
										</div>
									</div>

									<div class="flex items-center gap-2">
										{#if log.status === 'pending'}
											{#if isPast(log.scheduledTime)}
												<Badge variant="destructive" class="mr-2">
													<AlertCircle class="mr-1 size-3" />
													Overdue
												</Badge>
											{/if}
											<Button size="sm" onclick={() => onMarkTaken(log.id)}>
												<CheckCircle2 class="mr-1 size-4" />
												Taken
											</Button>
											<Button size="sm" variant="outline" onclick={() => openSkipDialog(log)}>
												<XCircle class="mr-1 size-4" />
												Skip
											</Button>
										{:else if log.status === 'taken'}
											<Badge variant="default" class="bg-green-500">
												<CheckCircle2 class="mr-1 size-3" />
												Taken
												{#if log.actualTime}
													at {formatTime(log.actualTime)}
												{/if}
											</Badge>
											<Button size="sm" variant="ghost" onclick={() => openEditTimeDialog(log)}>
												<Clock class="mr-2 size-4" />
												<span class="hidden sm:inline">Edit Time</span>
											</Button>
										{:else if log.status === 'skipped'}
											<Badge variant="secondary">
												<XCircle class="mr-1 size-3" />
												Skipped
											</Badge>
										{:else if log.status === 'missed'}
											<Badge variant="destructive">
												<AlertCircle class="mr-1 size-3" />
												Missed
											</Badge>
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Skip Dialog -->
<Dialog.Root bind:open={showSkipDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Skip Medication</Dialog.Title>
			<Dialog.Description>
				Optionally add a note explaining why you're skipping this dose.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="skip-notes">Notes (optional)</Label>
				<Textarea
					id="skip-notes"
					bind:value={skipNotes}
					placeholder="e.g., Forgot to take it, felt nauseous..."
					rows={3}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showSkipDialog = false)}>Cancel</Button>
			<Button onclick={confirmSkip}>Confirm Skip</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Time Dialog -->
<Dialog.Root bind:open={showEditTimeDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Time Taken</Dialog.Title>
			<Dialog.Description>Adjust the time when this dose was actually taken.</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="edit-time">Time Taken</Label>
				<Input id="edit-time" type="time" bind:value={editedTime} />
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showEditTimeDialog = false)}>Cancel</Button>
			<Button onclick={saveEditedTime}>Save Time</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Time Dialog -->
<Dialog.Root bind:open={showEditTimeDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Time Taken</Dialog.Title>
			<Dialog.Description>
				Adjust the time when this medication was actually taken.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="edit-time">Time Taken</Label>
				<Input id="edit-time" type="time" bind:value={editedTime} class="w-full" />
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Scheduled time: {editTimeLog ? formatTime(editTimeLog.scheduledTime) : ''}
				</p>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showEditTimeDialog = false)}>Cancel</Button>
			<Button onclick={saveEditedTime}>Save Time</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
