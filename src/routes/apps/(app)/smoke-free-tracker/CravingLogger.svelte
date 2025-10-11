<script lang="ts">
	import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-svelte';
	import { Button } from '@/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
	import { Badge } from '@/ui/badge';
	import { Label } from '@/ui/label';
	import { Textarea } from '@/ui/textarea';
	import * as Select from '@/ui/select';
	import type { SmokingAttempt } from './states.svelte';
	import { logCraving, getCravingsForAttempt, deleteCravingLog } from './states.svelte';

	interface Props {
		attempt: SmokingAttempt;
		onLogged?: () => void;
		compact?: boolean;
	}

	let { attempt, onLogged, compact = false }: Props = $props();

	// Form state
	let intensity = $state<1 | 2 | 3 | 4 | 5>(3);
	let trigger = $state('');
	let copingStrategy = $state('');
	let wasSuccessful = $state(true);
	let notes = $state('');

	// Cravings list
	let cravings = $derived(getCravingsForAttempt(attempt.id));

	// Common triggers
	const commonTriggers = [
		'Stress',
		'After meal',
		'Social situation',
		'Boredom',
		'Alcohol',
		'Coffee/tea',
		'Work break',
		'Driving',
		'Morning routine',
		'Other'
	];

	// Common coping strategies
	const commonStrategies = [
		'Deep breathing',
		'Exercise/walk',
		'Water/snack',
		'Call friend',
		'Distraction',
		'Meditation',
		'Chewing gum',
		'Read motivations',
		'Delay tactics',
		'Other'
	];

	function handleSubmit(e: Event) {
		e.preventDefault();

		logCraving(
			attempt.id,
			intensity,
			trigger || undefined,
			copingStrategy || undefined,
			notes || undefined,
			wasSuccessful
		);

		// Reset form
		intensity = 3;
		trigger = '';
		copingStrategy = '';
		wasSuccessful = true;
		notes = '';

		if (onLogged) onLogged();
	}

	function handleDelete(logId: string) {
		deleteCravingLog(logId);
	}

	function getIntensityColor(intensity: number) {
		if (intensity <= 2) return 'bg-green-500';
		if (intensity <= 3) return 'bg-yellow-500';
		return 'bg-red-500';
	}

	function getIntensityLabel(intensity: number) {
		const labels = ['Very Mild', 'Mild', 'Moderate', 'Strong', 'Very Strong'];
		return labels[intensity - 1];
	}
</script>

<Card class={compact ? 'border-none shadow-none' : ''}>
	{#if !compact}
		<CardHeader>
			<CardTitle>Craving Log</CardTitle>
		</CardHeader>
	{/if}
	<CardContent class={compact ? 'p-0' : 'space-y-6'}>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<Label for="intensity">Intensity (1-5)</Label>
				<div class="mt-2 flex gap-2">
					{#each [1, 2, 3, 4, 5] as level}
						<button
							type="button"
							class="flex-1 rounded-lg border-2 py-3 text-center transition-all {intensity === level
								? 'border-primary bg-primary text-primary-foreground'
								: 'border-border hover:border-primary/50'}"
							onclick={() => (intensity = level as 1 | 2 | 3 | 4 | 5)}
						>
							<div class="font-semibold">{level}</div>
							<div class="text-xs">{getIntensityLabel(level)}</div>
						</button>
					{/each}
				</div>
			</div>

			<div>
				<Label for="trigger">What triggered it?</Label>
				<Select.Root type="single" bind:value={trigger}>
					<Select.Trigger id="trigger">
						<span>{trigger || 'Select trigger'}</span>
					</Select.Trigger>
					<Select.Content>
						{#each commonTriggers as option}
							<Select.Item value={option} label={option}>{option}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div>
				<Label for="strategy">How did you cope?</Label>
				<Select.Root type="single" bind:value={copingStrategy}>
					<Select.Trigger id="strategy">
						<span>{copingStrategy || 'Select strategy'}</span>
					</Select.Trigger>
					<Select.Content>
						{#each commonStrategies as strategy}
							<Select.Item value={strategy} label={strategy}>
								{strategy}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div>
				<Label>Did you resist the craving?</Label>
				<div class="mt-2 flex gap-2">
					<button
						type="button"
						class="flex-1 rounded-lg border-2 p-3 transition-all {wasSuccessful
							? 'border-green-500 bg-green-500/10 text-green-600'
							: 'border-border hover:border-green-500/50'}"
						onclick={() => (wasSuccessful = true)}
					>
						<CheckCircle2 class="mx-auto mb-1 size-6" />
						<div class="text-sm font-semibold">Yes, I resisted!</div>
					</button>
					<button
						type="button"
						class="flex-1 rounded-lg border-2 p-3 transition-all {!wasSuccessful
							? 'border-red-500 bg-red-500/10 text-red-600'
							: 'border-border hover:border-red-500/50'}"
						onclick={() => (wasSuccessful = false)}
					>
						<XCircle class="mx-auto mb-1 size-6" />
						<div class="text-sm font-semibold">No, I gave in</div>
					</button>
				</div>
			</div>

			<div>
				<Label for="notes">Notes (optional)</Label>
				<Textarea id="notes" bind:value={notes} placeholder="Any additional thoughts..." rows={3} />
			</div>

			<Button type="submit" class="w-full">
				<Plus class="mr-2 size-4" />
				Log Craving
			</Button>
		</form>

		{#if !compact && cravings.length > 0}
			<div class="space-y-2">
				<h3 class="font-semibold">Recent Cravings</h3>
				<div class="space-y-2">
					{#each cravings.slice().reverse() as craving (craving.id)}
						<div
							class="rounded-lg border p-3 {craving.success
								? 'border-green-500/20 bg-green-500/5'
								: 'border-red-500/20 bg-red-500/5'}"
						>
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-1 flex items-center gap-2">
										<div class="size-3 rounded-full {getIntensityColor(craving.intensity)}"></div>
										<span class="text-sm font-medium">
											{getIntensityLabel(craving.intensity)} Intensity
										</span>
										{#if craving.success}
											<Badge variant="outline" class="border-green-500 text-green-500">
												Resisted
											</Badge>
										{:else}
											<Badge variant="outline" class="border-red-500 text-red-500">Gave In</Badge>
										{/if}
									</div>
									<p class="text-muted-foreground text-xs">
										{new Date(craving.timestamp).toLocaleString()}
									</p>
									{#if craving.trigger}
										<p class="mt-1 text-sm">
											<span class="font-semibold">Trigger:</span>
											{craving.trigger}
										</p>
									{/if}
									{#if craving.copingStrategy}
										<p class="text-sm">
											<span class="font-semibold">Strategy:</span>
											{craving.copingStrategy}
										</p>
									{/if}
									{#if craving.notes}
										<p class="text-muted-foreground mt-1 text-sm italic">{craving.notes}</p>
									{/if}
								</div>
								<Button variant="ghost" size="sm" onclick={() => handleDelete(craving.id)}>
									<Trash2 class="size-4 text-red-500" />
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</CardContent>
</Card>
