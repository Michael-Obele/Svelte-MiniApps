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

	// Add new medication
	function addMedication() {
		if (!medicationName.trim() || !medicationDosage.trim() || !medicationFrequency.trim()) {
			toast.error('Please fill in all required fields');
			return;
		}

		const newMed = medState.createMedication(
			medicationName.trim(),
			medicationDosage.trim(),
			medicationFrequency.trim(),
			medicationInstructions.trim(),
			new Date(medicationStartDate).toISOString(),
			medicationEndDate ? new Date(medicationEndDate).toISOString() : undefined
		);

		medState.addMedicationToSession(session.id, newMed);
		toast.success('Medication added successfully');

		// Reset form
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
		medicationStartDate = med.startDate.split('T')[0];
		medicationEndDate = med.endDate ? med.endDate.split('T')[0] : '';
		showEditDialog = true;
	}

	function saveEdit() {
		if (!editingMedication) return;

		medState.updateMedication(session.id, editingMedication.id, {
			name: medicationName.trim(),
			dosage: medicationDosage.trim(),
			frequency: medicationFrequency.trim(),
			instructions: medicationInstructions.trim(),
			startDate: new Date(medicationStartDate).toISOString(),
			endDate: medicationEndDate ? new Date(medicationEndDate).toISOString() : undefined
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

	function deleteMed() {
		if (!deletingMedication) return;

		medState.deleteMedication(session.id, deletingMedication.id);
		toast.success('Medication deleted');
		deletingMedication = null;
		showDeleteDialog = false;
	}

	// Schedule doses
	function openSchedule(med: Medication) {
		schedulingMedication = med;
		scheduleStartDate = new Date().toISOString().split('T')[0];
		scheduleEndDate = '';
		scheduleTimes = ['09:00'];
		showScheduleDialog = true;
	}

	function addScheduleTime() {
		scheduleTimes = [...scheduleTimes, '09:00'];
	}

	function removeScheduleTime(index: number) {
		scheduleTimes = scheduleTimes.filter((_, i) => i !== index);
	}

	function generateSchedule() {
		if (!schedulingMedication || scheduleTimes.length === 0) {
			toast.error('Please add at least one time');
			return;
		}

		const startDate = new Date(scheduleStartDate);
		const endDate = scheduleEndDate ? new Date(scheduleEndDate) : new Date(startDate);
		endDate.setDate(endDate.getDate() + 30); // Default 30 days if no end date

		let logsCreated = 0;
		const currentDate = new Date(startDate);
		const medId = schedulingMedication.id; // Store to satisfy TypeScript

		while (currentDate <= endDate) {
			scheduleTimes.forEach((time) => {
				const [hours, minutes] = time.split(':');
				const scheduleDateTime = new Date(currentDate);
				scheduleDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

				const log = medState.createLog(
					session.id,
					medId,
					scheduleDateTime.toISOString(),
					'pending'
				);
				medState.addLog(log);
				logsCreated++;
			});

			currentDate.setDate(currentDate.getDate() + 1);
		}

		toast.success(`Created ${logsCreated} scheduled doses`);
		showScheduleDialog = false;
		schedulingMedication = null;
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
</script>

<div class="mt-6">
	<Card>
		<CardHeader>
			<div class="flex items-center justify-between">
				<CardTitle>Medications</CardTitle>
				<Button onclick={() => (showAddDialog = true)}>
					<Plus class="mr-2 size-4" />
					Add Medication
				</Button>
			</div>
		</CardHeader>
		<CardContent>
			{#if session.medications.length === 0}
				<div class="py-8 text-center text-gray-500 dark:text-gray-400">
					<p>No medications added yet.</p>
					<Button onclick={() => (showAddDialog = true)} class="mt-4" variant="outline">
						<Plus class="mr-2 size-4" />
						Add Your First Medication
					</Button>
				</div>
			{:else}
				<div class="space-y-4">
					{#each session.medications as med (med.id)}
						<div
							class="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
							transition:slide
						>
							<div class="flex flex-1 items-start gap-4">
								<div class="mt-1 size-4 rounded-full" style="background-color: {med.color}"></div>
								<div class="flex-1">
									<h4 class="font-semibold text-gray-900 dark:text-white">{med.name}</h4>
									<div class="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
										<p><span class="font-medium">Dosage:</span> {med.dosage}</p>
										<p><span class="font-medium">Frequency:</span> {med.frequency}</p>
										{#if med.instructions}
											<p><span class="font-medium">Instructions:</span> {med.instructions}</p>
										{/if}
										<div class="flex gap-3 pt-1">
											<span class="flex items-center gap-1">
												<Calendar class="size-3" />
												{formatDate(med.startDate)}
											</span>
											{#if med.endDate}
												<span>→ {formatDate(med.endDate)}</span>
											{/if}
										</div>
									</div>
								</div>
							</div>

							<div class="flex gap-2">
								<Button variant="outline" size="sm" onclick={() => openSchedule(med)}>
									<Clock class="mr-1 size-4" />
									Schedule
								</Button>
								<Button variant="ghost" size="sm" onclick={() => startEdit(med)}>
									<Edit class="size-4" />
								</Button>
								<Button variant="ghost" size="sm" onclick={() => confirmDelete(med)}>
									<Trash2 class="size-4 text-red-500" />
								</Button>
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
					<Label for="med-start">Start Date</Label>
					<Input id="med-start" type="date" bind:value={medicationStartDate} />
				</div>

				<div class="space-y-2">
					<Label for="med-end">End Date (optional)</Label>
					<Input id="med-end" type="date" bind:value={medicationEndDate} />
				</div>
			</div>
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
					<Input id="edit-frequency" bind:value={medicationFrequency} />
				</div>
			</div>

			<div class="space-y-2">
				<Label for="edit-instructions">Instructions</Label>
				<Textarea id="edit-instructions" bind:value={medicationInstructions} rows={2} />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="edit-start">Start Date</Label>
					<Input id="edit-start" type="date" bind:value={medicationStartDate} />
				</div>

				<div class="space-y-2">
					<Label for="edit-end">End Date</Label>
					<Input id="edit-end" type="date" bind:value={medicationEndDate} />
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
					<Label for="schedule-start">Start Date</Label>
					<Input id="schedule-start" type="date" bind:value={scheduleStartDate} />
				</div>

				<div class="space-y-2">
					<Label for="schedule-end">End Date (optional)</Label>
					<Input id="schedule-end" type="date" bind:value={scheduleEndDate} />
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label>Daily Times</Label>
					<Button size="sm" variant="outline" onclick={addScheduleTime}>
						<Plus class="mr-1 size-3" />
						Add Time
					</Button>
				</div>
				<div class="space-y-2">
					{#each scheduleTimes as time, index}
						<div class="flex gap-2">
							<Input type="time" bind:value={scheduleTimes[index]} class="flex-1" />
							{#if scheduleTimes.length > 1}
								<Button variant="ghost" size="sm" onclick={() => removeScheduleTime(index)}>
									<Trash2 class="size-4 text-red-500" />
								</Button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
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
