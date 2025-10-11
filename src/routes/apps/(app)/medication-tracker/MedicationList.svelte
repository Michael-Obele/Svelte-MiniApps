<script lang="ts">
	import { Plus, Edit, Trash2, Clock, Calendar } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import { Textarea } from '@/ui/textarea';
	import * as Dialog from '@/ui/dialog';
	import * as AlertDialog from '@/ui/alert-dialog';
	import * as Select from '@/ui/select';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { toast } from 'svelte-sonner';
	import { slide } from 'svelte/transition';

	import * as medState from './states.svelte';
	import type { TreatmentSession, Medication } from './states.svelte';
	import ScheduleViewer from './ScheduleViewer.svelte';

	// Import remote functions
	import { deleteMedication } from '$lib/remote';

	// Props
	let { session, onAddMedication } = $props<{
		session: TreatmentSession;
		onAddMedication: () => void;
	}>();

	// State
	let showAddDialog = $state(false);
	let showEditDialog = $state(false);
	let showDeleteDialog = $state(false);
	let showScheduleDialog = $state(false);

	let medicationName = $state('');
	let medicationDosage = $state('');
	let medicationFrequency = $state('');
	let medicationInstructions = $state('');
	let medicationStartDate = $state(new Date().toISOString().split('T')[0]);
	let medicationEndDate = $state('');

	let editingMedication = $state<Medication | null>(null);
	let deletingMedication = $state<Medication | null>(null);
	let schedulingMedication = $state<Medication | null>(null);

	// Schedule state
	let scheduleStartDate = $state(new Date().toISOString().split('T')[0]);
	let scheduleEndDate = $state('');
	let scheduleTimes = $state<string[]>(['09:00']);
	let useAutoSchedule = $state(true);

	// Calculate expected doses on-the-fly
	let expectedDoses = $derived(
		medicationEndDate && medicationStartDate && medicationFrequency
			? medState.calculateExpectedDoses(medicationStartDate, medicationEndDate, medicationFrequency)
			: 0
	);

	// Get suggested times based on frequency
	let suggestedTimes = $derived(
		medicationFrequency ? medState.parseFrequency(medicationFrequency).suggestedTimes : ['09:00']
	);

	// Update schedule times when frequency changes in schedule dialog
	let scheduleExpectedDoses = $derived(
		schedulingMedication && scheduleStartDate
			? medState.calculateExpectedDoses(
					scheduleStartDate,
					scheduleEndDate || undefined,
					schedulingMedication.frequency
				)
			: 0
	);

	// Add new medication
	function addMedication() {
		if (!medicationName.trim()) {
			toast.error('Please enter medication name');
			return;
		}

		const medication = medState.createMedication(
			medicationName.trim(),
			medicationDosage.trim(),
			medicationFrequency.trim(),
			medicationInstructions.trim(),
			dateToISOString(medicationStartDate),
			medicationEndDate ? dateToISOString(medicationEndDate) : undefined
		);

		medState.addMedicationToSession(session.id, medication);
		toast.success('Medication added successfully');

		resetForm();
		showAddDialog = false;
	}

	// Edit medication
	function startEdit(med: Medication) {
		editingMedication = med;
		medicationName = med.name;
		medicationDosage = med.dosage;
		medicationFrequency = med.frequency;
		medicationInstructions = med.instructions || '';
		medicationStartDate = isoToDateString(med.startDate);
		medicationEndDate = isoToDateString(med.endDate);
		showEditDialog = true;
	}

	function saveEdit() {
		if (!editingMedication) return;

		medState.updateMedication(session.id, editingMedication.id, {
			name: medicationName.trim(),
			dosage: medicationDosage.trim(),
			frequency: medicationFrequency.trim(),
			instructions: medicationInstructions.trim(),
			startDate: dateToISOString(medicationStartDate),
			endDate: medicationEndDate ? dateToISOString(medicationEndDate) : undefined
		});

		toast.success('Medication updated');
		resetForm();
		showEditDialog = false;
		editingMedication = null;
	}

	// Delete medication
	function confirmDelete(med: Medication) {
		deletingMedication = med;
		showDeleteDialog = true;
	}

	async function deleteMed() {
		if (!deletingMedication) return;

		try {
			// Delete from server first
			await deleteMedication({ medicationId: deletingMedication.id });

			// Then delete from local state
			medState.deleteMedication(session.id, deletingMedication.id);
			toast.success('Medication deleted');
			deletingMedication = null;
			showDeleteDialog = false;
		} catch (error) {
			console.error('Failed to delete medication:', error);
			toast.error('Failed to delete medication. Please try again.');
		}
	}

	// Schedule doses
	function openSchedule(med: Medication) {
		schedulingMedication = med;
		scheduleStartDate = isoToDateString(med.startDate);
		scheduleEndDate = isoToDateString(med.endDate);
		// Auto-populate times based on frequency
		const { suggestedTimes } = medState.parseFrequency(med.frequency);
		scheduleTimes = suggestedTimes;
		useAutoSchedule = true;
		showScheduleDialog = true;
	}

	function addScheduleTime() {
		scheduleTimes = [...scheduleTimes, '09:00'];
	}

	function removeScheduleTime(index: number) {
		scheduleTimes = scheduleTimes.filter((_, i) => i !== index);
	}

	async function generateSchedule() {
		if (!schedulingMedication || scheduleTimes.length === 0) {
			toast.error('Please add at least one time');
			return;
		}

		try {
			// Clear ONLY future pending logs from the schedule start date onwards
			// This preserves past/present logs that haven't been taken yet
			await medState.deletePendingLogsForMedication(
				schedulingMedication.id,
				dateToISOString(scheduleStartDate)
			);

			const tempMed: Medication = {
				...schedulingMedication,
				startDate: dateToISOString(scheduleStartDate),
				endDate: scheduleEndDate ? dateToISOString(scheduleEndDate) : undefined
			};

			const logs = medState.autoGenerateSchedule(
				session.id,
				tempMed,
				useAutoSchedule ? undefined : scheduleTimes
			);

			// Add all logs (autoGenerateSchedule now checks for duplicates)
			logs.forEach((log) => medState.addLog(log));

			const message =
				logs.length > 0
					? `Created ${logs.length} scheduled doses`
					: 'Schedule updated (no new doses needed)';
			toast.success(message);
			showScheduleDialog = false;
			schedulingMedication = null;
		} catch (error) {
			console.error('Failed to generate schedule:', error);
			toast.error('Failed to update schedule. Please try again.');
		}
	}

	function resetForm() {
		medicationName = '';
		medicationDosage = '';
		medicationFrequency = '';
		medicationInstructions = '';
		medicationStartDate = new Date().toISOString().split('T')[0];
		medicationEndDate = '';
	}

	function formatDate(isoString: string): string {
		return new Date(isoString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Helper function to convert date string to ISO without timezone issues
	function dateToISOString(dateString: string): string {
		// Create date at noon local time to avoid timezone shifts
		const date = new Date(dateString + 'T12:00:00');
		return date.toISOString();
	}

	// Helper function to extract date part from ISO string
	function isoToDateString(isoString: string | undefined): string {
		if (!isoString) return '';
		return isoString.split('T')[0];
	}
</script>

<div class="mt-6">
	<Card>
		<CardHeader>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle>Medications</CardTitle>
				<Button onclick={() => (showAddDialog = true)} class="w-full sm:w-auto">
					<Plus class="mr-2 size-4" />
					<span class="xs:inline hidden">Add Medication</span>
					<span class="xs:hidden">Add</span>
				</Button>
			</div>
		</CardHeader>
		<CardContent>
			{#if session.medications.length === 0}
				<div class="py-8 text-center text-gray-500 dark:text-gray-400">
					<p>No medications added yet.</p>
					<Button
						onclick={() => (showAddDialog = true)}
						class="mt-4 w-full sm:w-auto"
						variant="outline"
					>
						<Plus class="mr-2 size-4" />
						<span class="xs:inline hidden">Add Your First Medication</span>
						<span class="xs:hidden">Add First Med</span>
					</Button>
				</div>
			{:else}
				<div class="space-y-4">
					{#each session.medications as med (med.id)}
						<div
							class="flex w-full flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4 dark:border-gray-700"
							transition:slide
						>
							<div class="flex flex-1 items-start gap-3 sm:gap-4">
								<div
									class="mt-1 size-4 flex-shrink-0 rounded-full"
									style="background-color: {med.color}"
								></div>
								<div class="min-w-0 flex-1">
									<h4 class="font-semibold text-gray-900 dark:text-white">{med.name}</h4>
									<div class="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
										<p><span class="font-medium">Dosage:</span> {med.dosage}</p>
										<p><span class="font-medium">Frequency:</span> {med.frequency}</p>
										{#if med.instructions}
											<p><span class="font-medium">Instructions:</span> {med.instructions}</p>
										{/if}
										<div class="flex flex-wrap gap-3 pt-1">
											<span class="flex items-center gap-1">
												<Calendar class="size-3" />
												{formatDate(med.startDate)}
											</span>
											{#if med.endDate}
												<span
													class="flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400"
												>
													<Clock class="size-3" />
													Ends: {formatDate(med.endDate)}
												</span>
											{:else}
												<span class="text-sm font-medium text-green-600 dark:text-green-400">
													Ongoing
												</span>
											{/if}
										</div>
									</div>
								</div>
							</div>

							<div class="flex w-full flex-col gap-2 sm:w-auto sm:min-w-fit">
								<!-- View Schedule button gets its own row -->
								<div class="flex w-full">
									<ScheduleViewer {session} medication={med} />
								</div>

								<!-- Action buttons in a grid layout for mobile, flex for desktop -->
								<div class="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap">
									<Button
										variant="outline"
										size="sm"
										onclick={() => openSchedule(med)}
										class="flex flex-col items-center justify-center gap-1 px-2 py-3 sm:flex-row sm:gap-2 sm:px-3 sm:py-2"
									>
										<Clock class="size-4 sm:mr-0" />
										<span class="text-xs sm:text-sm">Schedule</span>
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => startEdit(med)}
										class="flex flex-col items-center justify-center gap-1 px-2 py-3 sm:flex-row sm:gap-2 sm:px-3 sm:py-2"
									>
										<Edit class="size-4" />
										<span class="text-xs sm:text-sm">Edit</span>
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => confirmDelete(med)}
										class="flex flex-col items-center justify-center gap-1 px-2 py-3 sm:flex-row sm:gap-2 sm:px-3 sm:py-2"
									>
										<Trash2 class="size-4 text-red-500" />
										<span class="text-xs sm:text-sm">Delete</span>
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Add Medication Dialog -->
<Dialog.Root bind:open={showAddDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Medication</Dialog.Title>
			<Dialog.Description>Add a new medication to this treatment session.</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="med-name">Medication Name *</Label>
				<Input id="med-name" bind:value={medicationName} placeholder="e.g., Amoxicillin" />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="med-dosage">Dosage *</Label>
					<Input id="med-dosage" bind:value={medicationDosage} placeholder="e.g., 500mg" />
				</div>

				<div class="space-y-2">
					<Label for="med-frequency">Frequency *</Label>
					<Select.Root type="single" bind:value={medicationFrequency} name="frequency">
						<Select.Trigger class="w-full">
							{medicationFrequency || 'Select frequency'}
						</Select.Trigger>
						<Select.Content>
							{#each medState.frequencyPresets as preset (preset)}
								<Select.Item value={preset} label={preset}>
									{preset}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="med-instructions">Instructions (optional)</Label>
				<Textarea
					id="med-instructions"
					bind:value={medicationInstructions}
					placeholder="e.g., Take with food"
					rows={2}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="med-start">Start Date *</Label>
					<Input id="med-start" type="date" bind:value={medicationStartDate} />
				</div>

				<div class="space-y-2">
					<Label for="med-end" class="flex items-center gap-2">
						End Date
						<span class="text-xs text-gray-500 dark:text-gray-400"
							>(optional - leave empty for ongoing)</span
						>
					</Label>
					<Input
						id="med-end"
						type="date"
						bind:value={medicationEndDate}
						placeholder="Leave empty for ongoing medication"
					/>
				</div>
			</div>

			{#if expectedDoses > 0}
				<div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
					<p class="text-sm text-blue-800 dark:text-blue-200">
						📊 Expected total doses: <strong>{expectedDoses}</strong>
						{#if suggestedTimes.length > 0}
							• Suggested times: {suggestedTimes.join(', ')}
						{/if}
					</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showAddDialog = false)}>Cancel</Button>
			<Button onclick={addMedication}>Add Medication</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Medication Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Medication</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="edit-name">Medication Name *</Label>
				<Input id="edit-name" bind:value={medicationName} />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-dosage">Dosage *</Label>
					<Input id="edit-dosage" bind:value={medicationDosage} />
				</div>

				<div class="space-y-2">
					<Label for="edit-frequency">Frequency *</Label>
					<Select.Root type="single" bind:value={medicationFrequency} name="frequency">
						<Select.Trigger class="w-full">
							{medicationFrequency || 'Select frequency'}
						</Select.Trigger>
						<Select.Content>
							{#each medState.frequencyPresets as preset (preset)}
								<Select.Item value={preset} label={preset}>
									{preset}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="edit-instructions">Instructions</Label>
				<Textarea id="edit-instructions" bind:value={medicationInstructions} rows={2} />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-start">Start Date *</Label>
					<Input id="edit-start" type="date" bind:value={medicationStartDate} />
				</div>

				<div class="space-y-2">
					<Label for="edit-end" class="flex items-center gap-2">
						End Date
						<span class="text-xs text-gray-500 dark:text-gray-400"
							>(optional - leave empty for ongoing)</span
						>
					</Label>
					<Input
						id="edit-end"
						type="date"
						bind:value={medicationEndDate}
						placeholder="Leave empty for ongoing medication"
					/>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showEditDialog = false)}>Cancel</Button>
			<Button onclick={saveEdit}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Schedule Dialog -->
<Dialog.Root bind:open={showScheduleDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Schedule Doses</Dialog.Title>
			<Dialog.Description>
				Create scheduled reminders for {schedulingMedication?.name}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="schedule-start">Start Date *</Label>
					<Input id="schedule-start" type="date" bind:value={scheduleStartDate} />
				</div>

				<div class="space-y-2">
					<Label for="schedule-end" class="flex items-center gap-2">
						End Date
						<span class="text-xs text-gray-500 dark:text-gray-400"
							>(optional - leave empty for ongoing)</span
						>
					</Label>
					<Input
						id="schedule-end"
						type="date"
						bind:value={scheduleEndDate}
						placeholder="Leave empty for ongoing medication"
					/>
				</div>
			</div>

			<!-- Schedule Type Toggle -->
			<div class="space-y-2">
				<Label>Schedule Type</Label>
				<div class="flex flex-wrap gap-2 sm:flex-row sm:gap-2">
					<Button
						variant={useAutoSchedule ? 'default' : 'outline'}
						size="sm"
						onclick={() => {
							useAutoSchedule = true;
							if (schedulingMedication) {
								const { suggestedTimes } = medState.parseFrequency(schedulingMedication.frequency);
								scheduleTimes = suggestedTimes;
							}
						}}
						class="flex-1 sm:flex-none"
					>
						<span class="hidden sm:inline">Auto (Based on Frequency)</span>
						<span class="sm:hidden">Auto Schedule</span>
					</Button>
					<Button
						variant={!useAutoSchedule ? 'default' : 'outline'}
						size="sm"
						onclick={() => (useAutoSchedule = false)}
						class="flex-1 sm:flex-none"
					>
						<span class="hidden sm:inline">Custom Times</span>
						<span class="sm:hidden">Custom</span>
					</Button>
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<Label>Daily Times</Label>
					{#if !useAutoSchedule}
						<Button size="sm" variant="outline" onclick={addScheduleTime} class="w-full sm:w-auto">
							<Plus class="mr-1 size-3" />
							<span class="xs:inline hidden">Add Time</span>
							<span class="xs:hidden">Add</span>
						</Button>
					{/if}
				</div>
				<div class="space-y-2">
					{#each scheduleTimes as time, index}
						<div class="flex gap-2">
							<Input
								type="time"
								bind:value={scheduleTimes[index]}
								class="flex-1"
								disabled={useAutoSchedule}
							/>
							{#if scheduleTimes.length > 1 && !useAutoSchedule}
								<Button variant="ghost" size="sm" onclick={() => removeScheduleTime(index)}>
									<Trash2 class="size-4 text-red-500" />
								</Button>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			{#if scheduleExpectedDoses > 0}
				<div class="rounded-lg bg-green-50 p-3 dark:bg-green-950">
					<p class="text-sm text-green-800 dark:text-green-200">
						✅ Will create <strong>{scheduleExpectedDoses}</strong> scheduled doses ({scheduleTimes.length}x
						per day)
					</p>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showScheduleDialog = false)}>Cancel</Button>
			<Button onclick={generateSchedule}>Generate Schedule</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Medication?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete "{deletingMedication?.name}" and all its logs. This action
				cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={deleteMed}>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
