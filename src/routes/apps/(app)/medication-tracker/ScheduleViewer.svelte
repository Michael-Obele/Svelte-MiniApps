<script lang="ts">
	import { Calendar, Trash2, Clock, CheckCircle2, XCircle, AlertCircle } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Badge } from '@/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
	import * as Dialog from '@/ui/dialog';
	import * as AlertDialog from '@/ui/alert-dialog';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';

	import * as medState from './states.svelte';
	import type { TreatmentSession, Medication, MedicationLog } from './states.svelte';

	// Props
	let { session, medication } = $props<{
		session: TreatmentSession;
		medication: Medication;
	}>();

	// State
	let showViewer = $state(false);
	let showDeleteDialog = $state(false);
	let logToDelete = $state<MedicationLog | null>(null);

	// Get logs for this medication using $derived
	let medicationLogs = $derived(
		medState
			.getLogsForMedication(medication.id)
			.filter((log) => log.sessionId === session.id)
			.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
	);

	// Group logs by date
	let logsByDate = $derived.by(() => {
		const grouped = new Map<string, MedicationLog[]>();

		medicationLogs.forEach((log) => {
			const date = new Date(log.scheduledTime).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});

			if (!grouped.has(date)) {
				grouped.set(date, []);
			}
			grouped.get(date)!.push(log);
		});

		return grouped;
	});

	// Confirm delete
	function confirmDelete(log: MedicationLog) {
		logToDelete = log;
		showDeleteDialog = true;
	}

	// Delete log
	function deleteScheduledLog() {
		if (!logToDelete) return;

		medState.deleteLog(logToDelete.id);
		toast.success('Scheduled dose deleted');
		logToDelete = null;
		showDeleteDialog = false;
	}

	// Delete all pending logs for this medication
	function deleteAllPending() {
		const pendingLogs = medicationLogs.filter((log) => log.status === 'pending');
		pendingLogs.forEach((log) => medState.deleteLog(log.id));
		toast.success(`Deleted ${pendingLogs.length} pending doses`);
		showViewer = false;
	}

	// Format time
	function formatTime(isoString: string): string {
		return new Date(isoString).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	// Get status color
	function getStatusColor(status: MedicationLog['status']): string {
		switch (status) {
			case 'taken':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'skipped':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'missed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'pending':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
		}
	}

	// Get status icon
	function getStatusIcon(status: MedicationLog['status']) {
		switch (status) {
			case 'taken':
				return CheckCircle2;
			case 'skipped':
				return XCircle;
			case 'missed':
				return AlertCircle;
			case 'pending':
				return Clock;
		}
	}

	// Stats
	let totalLogs = $derived(medicationLogs.length);
	let pendingCount = $derived(medicationLogs.filter((l) => l.status === 'pending').length);
	let takenCount = $derived(medicationLogs.filter((l) => l.status === 'taken').length);
</script>

<Button variant="outline" size="sm" onclick={() => (showViewer = true)}>
	<Calendar class="mr-2 size-4" />
	View Schedule ({totalLogs})
</Button>

<Dialog.Root bind:open={showViewer}>
	<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Schedule for {medication.name}</Dialog.Title>
			<Dialog.Description>
				{medication.dosage} • {medication.frequency}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<!-- Stats Summary -->
			<div class="grid grid-cols-3 gap-3">
				<Card>
					<CardContent class="pt-4">
						<div class="text-center">
							<p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</p>
							<p class="text-xs text-gray-600 dark:text-gray-400">Pending</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-4">
						<div class="text-center">
							<p class="text-2xl font-bold text-green-600 dark:text-green-400">{takenCount}</p>
							<p class="text-xs text-gray-600 dark:text-gray-400">Taken</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-4">
						<div class="text-center">
							<p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{totalLogs}</p>
							<p class="text-xs text-gray-600 dark:text-gray-400">Total</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Logs by Date -->
			{#if logsByDate.size === 0}
				<div class="py-8 text-center text-gray-500 dark:text-gray-400">
					<p>No scheduled doses yet.</p>
				</div>
			{:else}
				<div class="space-y-4">
					{#each Array.from(logsByDate.entries()) as [date, logs] (date)}
						<div class="space-y-2" transition:slide>
							<h4 class="font-semibold text-gray-900 dark:text-white">{date}</h4>
							<div class="space-y-2">
								{#each logs as log (log.id)}
									{@const StatusIcon = getStatusIcon(log.status)}
									<div
										class="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700"
										transition:slide
									>
										<div class="flex items-center gap-3">
											<StatusIcon
												class="size-5 {log.status === 'taken'
													? 'text-green-600'
													: log.status === 'skipped'
														? 'text-yellow-600'
														: log.status === 'missed'
															? 'text-red-600'
															: 'text-blue-600'}"
											/>
											<div class="flex-1">
												<p class="text-sm font-medium text-gray-900 dark:text-white">
													{formatTime(log.scheduledTime)}
												</p>
												{#if log.notes}
													<p class="text-xs text-gray-600 dark:text-gray-400">{log.notes}</p>
												{/if}
											</div>
										</div>

										<div class="flex items-center gap-2 self-end sm:self-auto">
											<Badge class={getStatusColor(log.status)}>
												{log.status}
											</Badge>
											{#if log.status === 'pending'}
												<Button variant="ghost" size="sm" onclick={() => confirmDelete(log)}>
													<Trash2 class="size-4 text-red-500" />
												</Button>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<Dialog.Footer class="flex-col gap-2 sm:flex-row">
			{#if pendingCount > 0}
				<Button variant="destructive" size="sm" onclick={deleteAllPending} class="w-full sm:w-auto">
					<span class="hidden sm:inline">Delete All Pending ({pendingCount})</span>
					<span class="sm:hidden">Delete All ({pendingCount})</span>
				</Button>
			{/if}
			<Button variant="outline" onclick={() => (showViewer = false)} class="w-full sm:w-auto"
				>Close</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Single Log Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Scheduled Dose?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete this scheduled dose. This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={deleteScheduledLog}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
