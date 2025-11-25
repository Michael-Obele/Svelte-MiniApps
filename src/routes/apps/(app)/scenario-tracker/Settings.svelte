<script lang="ts">
	import { enhance } from '$app/forms';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		CalendarDate,
		parseDate,
		today
	} from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { buttonVariants, Button } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { Settings as SettingsIcon, Save, X } from 'lucide-svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		startDate: Date;
		endDate: Date;
		onSave: (startDate: Date, endDate: Date) => void;
		isAuthenticated: boolean;
	}

	let { open, onOpenChange, startDate, endDate, onSave, isAuthenticated }: Props = $props();

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	});

	// Convert JS Dates to CalendarDate for the picker
	function dateToCalendarDate(d: Date): CalendarDate {
		return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
	}

	// Convert CalendarDate back to JS Date
	function calendarDateToDate(cd: DateValue): Date {
		return cd.toDate(getLocalTimeZone());
	}

	// Local state for editing - initialized from props
	let editStartDate = $state<DateValue | undefined>(undefined);
	let editEndDate = $state<DateValue | undefined>(undefined);

	// Track if we've initialized this session
	let initialized = $state(false);

	// Initialize/reset when dialog opens with new values
	$effect(() => {
		if (open && !initialized) {
			editStartDate = dateToCalendarDate(startDate);
			editEndDate = dateToCalendarDate(endDate);
			initialized = true;
		}
		if (!open) {
			initialized = false;
		}
	});

	// Calculate duration in years
	let durationYears = $derived.by(() => {
		if (!editStartDate || !editEndDate) return 0;
		const start = calendarDateToDate(editStartDate);
		const end = calendarDateToDate(editEndDate);
		return Math.round(((end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10;
	});

	// Validate dates
	let isValid = $derived.by(() => {
		if (!editStartDate || !editEndDate) return false;
		const start = calendarDateToDate(editStartDate);
		const end = calendarDateToDate(editEndDate);
		return end > start;
	});

	function handleSave() {
		if (!editStartDate || !editEndDate) {
			toast.error('Please select both start and end dates');
			return;
		}

		const start = calendarDateToDate(editStartDate);
		const end = calendarDateToDate(editEndDate);

		if (end <= start) {
			toast.error('End date must be after start date');
			return;
		}

		onSave(start, end);
		onOpenChange(false);
		toast.success('Timeline settings saved');
	}

	function handleCancel() {
		onOpenChange(false);
	}

	// Quick presets
	function setPreset(years: number) {
		const now = today(getLocalTimeZone());
		editStartDate = now;
		editEndDate = now.add({ years });
	}
</script>

<Dialog.Root {open} onOpenChange={onOpenChange}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<SettingsIcon class="size-5" />
				Timeline Settings
			</Dialog.Title>
			<Dialog.Description>
				Adjust your planning horizon. This affects the "Time Remaining" calculations.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-6 py-4">
			<!-- Quick Presets -->
			<div class="space-y-2">
				<Label>Quick Presets</Label>
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onclick={() => setPreset(1)}>1 Year</Button>
					<Button variant="outline" size="sm" onclick={() => setPreset(3)}>3 Years</Button>
					<Button variant="outline" size="sm" onclick={() => setPreset(5)}>5 Years</Button>
					<Button variant="outline" size="sm" onclick={() => setPreset(10)}>10 Years</Button>
					<Button variant="outline" size="sm" onclick={() => setPreset(15)}>15 Years</Button>
				</div>
			</div>

			<!-- Start Date Picker -->
			<div class="space-y-2">
				<Label>Start Date</Label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({
								variant: 'outline',
								class: 'w-full justify-start text-start font-normal'
							}),
							!editStartDate && 'text-muted-foreground'
						)}
					>
						<CalendarIcon class="mr-2 size-4" />
						{editStartDate
							? df.format(editStartDate.toDate(getLocalTimeZone()))
							: 'Pick a start date'}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar type="single" bind:value={editStartDate} />
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- End Date Picker -->
			<div class="space-y-2">
				<Label>End Date (Deadline)</Label>
				<Popover.Root>
					<Popover.Trigger
						class={cn(
							buttonVariants({
								variant: 'outline',
								class: 'w-full justify-start text-start font-normal'
							}),
							!editEndDate && 'text-muted-foreground'
						)}
					>
						<CalendarIcon class="mr-2 size-4" />
						{editEndDate ? df.format(editEndDate.toDate(getLocalTimeZone())) : 'Pick an end date'}
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar
							type="single"
							bind:value={editEndDate}
							minValue={editStartDate?.add({ days: 1 })}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Duration Preview -->
			{#if editStartDate && editEndDate}
				<div class="bg-muted rounded-lg p-4">
					<div class="text-sm font-medium">Planning Duration</div>
					<div class="text-2xl font-bold">
						{durationYears} years
					</div>
					{#if !isValid}
						<p class="mt-2 text-sm text-red-500">
							⚠️ End date must be after start date
						</p>
					{/if}
				</div>
			{/if}

			{#if !isAuthenticated}
				<div class="bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-500/20 p-4 text-sm">
					<strong>Note:</strong> You're not logged in. Settings will be saved locally and won't sync across
					devices. <a href="/login" class="underline">Sign in</a> to sync your data.
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={handleCancel}>
				<X class="mr-2 size-4" />
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={!isValid}>
				<Save class="mr-2 size-4" />
				Save Settings
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
