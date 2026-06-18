<script lang="ts">
	import { Button } from '@/ui/button';
	import * as Dialog from '@/ui/dialog';
	import { Textarea } from '@/ui/textarea';
	import { Input } from '@/ui/input';
	import { Label } from '@/ui/label';
	import type { MedicationLog } from '../states.svelte';

	let {
		openDialog = $bindable(''),
		currentLog = $bindable<MedicationLog | null>(null),

		skipTitle = 'Skip Medication',
		skipDescription = "Optionally add a note explaining why you're skipping this dose.",
		onSkipConfirm,

		editTitle = 'Edit Time Taken',
		editDescription = 'Adjust the time when this medication was actually taken.',
		includeDateInEdit = false,
		editDate = $bindable(''),
		editTime = $bindable(''),
		scheduledTime = '',
		onEditSave,

		rescheduleTitle = 'Reschedule Medication',
		rescheduleDescription = 'Change when this dose is scheduled to be taken.',
		rescheduleDate = $bindable(''),
		rescheduleTime = $bindable(''),
		onRescheduleSave
	}: {
		openDialog?: string;
		currentLog?: MedicationLog | null;
		skipTitle?: string;
		skipDescription?: string;
		onSkipConfirm?: (logId: string, notes?: string) => void;
		editTitle?: string;
		editDescription?: string;
		includeDateInEdit?: boolean;
		editDate?: string;
		editTime?: string;
		scheduledTime?: string;
		onEditSave?: (logId: string, date: string, time: string) => void;
		rescheduleTitle?: string;
		rescheduleDescription?: string;
		rescheduleDate?: string;
		rescheduleTime?: string;
		onRescheduleSave?: (logId: string, date: string, time: string) => void;
	} = $props();

	// Internal state (not bound from parent)
	let skipNotes = $state('');

	function handleSkipConfirm() {
		if (currentLog && onSkipConfirm) {
			onSkipConfirm(currentLog.id, skipNotes.trim() || undefined);
			openDialog = '';
			skipNotes = '';
		}
	}

	function handleEditSave() {
		if (currentLog && onEditSave) {
			onEditSave(currentLog.id, editDate, editTime);
			openDialog = '';
		}
	}

	function handleRescheduleSave() {
		if (currentLog && onRescheduleSave) {
			onRescheduleSave(currentLog.id, rescheduleDate, rescheduleTime);
			openDialog = '';
		}
	}

	function closeDialog() {
		openDialog = '';
		skipNotes = '';
	}
</script>

<!-- Skip Dialog -->
<Dialog.Root
	open={openDialog === 'skip'}
	onOpenChange={(o) => {
		if (!o) closeDialog();
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{skipTitle}</Dialog.Title>
			<Dialog.Description>{skipDescription}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="dose-skip-notes">Notes (optional)</Label>
				<Textarea
					id="dose-skip-notes"
					bind:value={skipNotes}
					placeholder="e.g., Forgot to take it, felt nauseous..."
					rows={3}
				/>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={closeDialog}>Cancel</Button>
			<Button onclick={handleSkipConfirm}>Skip Medication</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Time Dialog -->
<Dialog.Root
	open={openDialog === 'edit-time'}
	onOpenChange={(o) => {
		if (!o) closeDialog();
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{editTitle}</Dialog.Title>
			<Dialog.Description>{editDescription}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			{#if includeDateInEdit}
				<div class="space-y-2">
					<Label for="dose-edit-date">Date</Label>
					<Input id="dose-edit-date" type="date" bind:value={editDate} class="w-full" />
				</div>
			{/if}
			<div class="space-y-2">
				<Label for="dose-edit-time">Time</Label>
				<Input id="dose-edit-time" type="time" bind:value={editTime} class="w-full" />
			</div>
			{#if scheduledTime}
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Scheduled time: {scheduledTime}
				</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={closeDialog}>Cancel</Button>
			<Button onclick={handleEditSave}>Save Time</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Reschedule Dialog -->
<Dialog.Root
	open={openDialog === 'reschedule'}
	onOpenChange={(o) => {
		if (!o) closeDialog();
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{rescheduleTitle}</Dialog.Title>
			<Dialog.Description>{rescheduleDescription}</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			<div class="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
				<p class="text-sm text-blue-800 dark:text-blue-200">
					💡 This reschedules only this single dose. To change the entire medication schedule, use
					the Schedule button in the Medications list.
				</p>
			</div>
			<div class="space-y-2">
				<Label for="dose-reschedule-date">New Date</Label>
				<Input id="dose-reschedule-date" type="date" bind:value={rescheduleDate} class="w-full" />
			</div>
			<div class="space-y-2">
				<Label for="dose-reschedule-time">New Time</Label>
				<Input id="dose-reschedule-time" type="time" bind:value={rescheduleTime} class="w-full" />
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={closeDialog}>Cancel</Button>
			<Button onclick={handleRescheduleSave}>Reschedule</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
