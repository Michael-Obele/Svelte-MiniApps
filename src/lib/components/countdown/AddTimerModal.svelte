<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { cn } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(),
		editingTimer = $bindable(null),
		onSave
	} = $props<{
		open: boolean;
		editingTimer?: { id: string; title: string; targetDate: string; color: string } | null;
		onSave: (timer: { title: string; targetDate: string; color: string }) => void;
	}>();

	let title = $state('');
	let date = $state('');

	// Time components
	let hour = $state('');
	let minute = $state('');
	let period = $state('PM'); // AM/PM

	// Solid matte colors
	let selectedColor = $state('text-blue-600');

	const colors = [
		{
			label: 'Carbon',
			value: 'text-slate-900 dark:text-slate-100',
			class: 'bg-slate-900 dark:bg-slate-100'
		},
		{ label: 'Blue', value: 'text-blue-600 dark:text-blue-400', class: 'bg-blue-600' },
		{ label: 'Indigo', value: 'text-indigo-600 dark:text-indigo-400', class: 'bg-indigo-600' },
		{ label: 'Rose', value: 'text-rose-600 dark:text-rose-400', class: 'bg-rose-600' },
		{ label: 'Orange', value: 'text-orange-600 dark:text-orange-400', class: 'bg-orange-600' },
		{ label: 'Emerald', value: 'text-emerald-600 dark:text-emerald-400', class: 'bg-emerald-600' }
	];

	$effect(() => {
		if (open && editingTimer) {
			title = editingTimer.title;
			selectedColor = editingTimer.color;
			const d = new Date(editingTimer.targetDate);
			date = d.toISOString().split('T')[0];

			let h = d.getHours();
			const m = d.getMinutes();

			period = h >= 12 ? 'PM' : 'AM';
			h = h % 12;
			h = h ? h : 12; // the hour '0' should be '12'

			hour = h.toString();
			minute = m.toString().padStart(2, '0');
		} else if (open && !editingTimer) {
			// Reset only if not editing (creating new)
			// Check if we already have values (to prevent clearing if just re-opening same new form?)
			// Actually, usually a fresh open means fresh form unless persistance is desired.
			// For simplicity, let's clear on new open if title is empty?
			if (!title) {
				selectedColor = colors[1].value;
				// Set defaults to current time + 1 hour approx?
				const now = new Date();
				now.setHours(now.getHours() + 1);
				date = now.toISOString().split('T')[0];
				let h = now.getHours();
				period = h >= 12 ? 'PM' : 'AM';
				h = h % 12;
				h = h ? h : 12;
				hour = h.toString();
				minute = now.getMinutes().toString().padStart(2, '0');
			}
		}
	});

	// Reset when closed
	$effect(() => {
		if (!open) {
			// Optional: delayed clear?
			// For now, let's rely on parent to clear editingTimer
		}
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!title || !date || !hour || !minute) {
			toast.error('Please fill in all fields');
			return;
		}

		// Validate Minute
		let m = parseInt(minute, 10);
		if (isNaN(m) || m < 0 || m > 59) {
			toast.error('Minutes must be between 0 and 59');
			return;
		}

		// Validate Hour
		let h = parseInt(hour, 10);
		if (isNaN(h) || h < 1 || h > 12) {
			toast.error('Hour must be between 1 and 12');
			return;
		}

		if (period === 'PM' && h < 12) h += 12;
		if (period === 'AM' && h === 12) h = 0;

		const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
		const targetDate = `${date}T${timeString}:00`;

		if (new Date(targetDate).getTime() <= Date.now()) {
			toast.error('Please select a future date and time');
			return;
		}

		onSave({ title, targetDate, color: selectedColor });

		// Clear logic handled by parent or next open
		title = '';
	}

	// Auto-format minutes on blur
	function handleMinuteBlur() {
		if (minute && !isNaN(parseInt(minute))) {
			minute = parseInt(minute).toString().padStart(2, '0');
		}
	}

	const hours = Array.from({ length: 12 }, (_, i) => ({
		value: (i + 1).toString(),
		label: (i + 1).toString()
	}));
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{editingTimer ? 'Edit Countdown' : 'Create Countdown'}</Dialog.Title>
			<Dialog.Description class="hidden">Form</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="title" class="text-muted-foreground text-xs tracking-wider uppercase"
					>Label</Label
				>
				<Input
					id="title"
					bind:value={title}
					placeholder="e.g. Product Launch"
					required
					class="focus-visible:border-primary rounded-none border-x-0 border-t-0 border-b-2 bg-transparent px-0 text-lg font-semibold placeholder:font-normal focus-visible:ring-0"
				/>
			</div>

			<div class="grid gap-2">
				<Label for="date" class="text-muted-foreground text-xs tracking-wider uppercase">Date</Label
				>
				<Input id="date" type="date" bind:value={date} required class="bg-muted/30 border-muted" />
			</div>

			<div class="grid gap-2">
				<Label class="text-muted-foreground text-xs tracking-wider uppercase">Time (12-hour)</Label>
				<div class="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
					<!-- Hour Select -->
					<div class="relative">
						<select
							bind:value={hour}
							class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full appearance-none items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							required
						>
							<option value="" disabled selected>Hr</option>
							{#each hours as h}
								<option value={h.value}>{h.label}</option>
							{/each}
						</select>
						<div
							class="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 9l-7 7-7-7"
								></path></svg
							>
						</div>
					</div>

					<span class="text-muted-foreground text-center">:</span>

					<!-- Minute Input (Free text/number) -->
					<Input
						type="number"
						min="0"
						max="59"
						placeholder="Min"
						bind:value={minute}
						onblur={handleMinuteBlur}
						class="text-center"
						required
					/>

					<!-- AM/PM Toggle -->
					<div class="bg-muted/30 ml-2 flex rounded-md border p-1">
						<button
							type="button"
							class={cn(
								'rounded-sm px-3 py-1 text-xs font-medium transition-all',
								period === 'AM'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
							onclick={() => (period = 'AM')}>AM</button
						>
						<button
							type="button"
							class={cn(
								'rounded-sm px-3 py-1 text-xs font-medium transition-all',
								period === 'PM'
									? 'bg-background text-foreground shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
							onclick={() => (period = 'PM')}>PM</button
						>
					</div>
				</div>
			</div>

			<div class="grid gap-3">
				<Label class="text-muted-foreground text-xs tracking-wider uppercase">Accent Color</Label>
				<div class="flex flex-wrap gap-3">
					{#each colors as color}
						<button
							type="button"
							class={cn(
								'focus:ring-ring h-6 w-6 rounded-full transition-all hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none',
								color.class,
								selectedColor === color.value ? 'ring-primary scale-110 ring-2 ring-offset-2' : ''
							)}
							onclick={() => (selectedColor = color.value)}
							title={color.label}
						></button>
					{/each}
				</div>
			</div>

			<Dialog.Footer class="mt-4">
				<Button type="submit" class="w-full"
					>{editingTimer ? 'Update Timer' : 'Start Countdown'}</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
