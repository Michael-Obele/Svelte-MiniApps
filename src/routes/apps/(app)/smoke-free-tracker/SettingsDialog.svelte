<script lang="ts">
	import { DollarSign, Settings as SettingsIcon, Plus, Trash2, Calendar } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import * as Dialog from '@/ui/dialog';
	import { Label } from '@/ui/label';
	import { Input } from '@/ui/input';
	import * as Select from '@/ui/select';
	import { Checkbox } from '@/ui/checkbox';
	import {
		userSettings,
		updateSettings,
		getActiveAttempt,
		setCustomStartDate
	} from './states.svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	let cigarettesPerDay = $state(userSettings.current.cigarettesPerDay);
	let pricePerPack = $state(userSettings.current.pricePerPack);
	let cigarettesPerPack = $state(userSettings.current.cigarettesPerPack);
	let currency = $state(userSettings.current.currency);
	let motivationalGoals = $state([...userSettings.current.motivationalGoals]);
	let newGoal = $state('');

	// Custom start date for existing streaks
	let customStartDate = $state('');
	let customStartDateEnabled = $state(false);
	let activeAttempt = $derived(getActiveAttempt());

	// Initialize settings when dialog opens
	$effect(() => {
		if (open) {
			customStartDateEnabled = userSettings.current.customStartDateEnabled;
			cigarettesPerDay = userSettings.current.cigarettesPerDay;
			pricePerPack = userSettings.current.pricePerPack;
			cigarettesPerPack = userSettings.current.cigarettesPerPack;
			currency = userSettings.current.currency;
			motivationalGoals = [...userSettings.current.motivationalGoals];
		}
	});

	const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'NGN'];

	function handleSave() {
		updateSettings({
			cigarettesPerDay,
			pricePerPack,
			cigarettesPerPack,
			currency,
			motivationalGoals,
			customStartDateEnabled
		});
		open = false;
	}

	function addGoal() {
		if (newGoal.trim()) {
			motivationalGoals = [...motivationalGoals, newGoal.trim()];
			newGoal = '';
		}
	}

	function removeGoal(index: number) {
		motivationalGoals = motivationalGoals.filter((_, i) => i !== index);
	}

	function handleSetCustomStartDate() {
		console.log('Setting custom start date:', customStartDate);
		console.log('Active attempt:', activeAttempt?.id);
		if (!activeAttempt || !customStartDate) return;

		const success = setCustomStartDate(activeAttempt?.id, customStartDate);
		if (success) {
			customStartDate = '';
			// Refresh active attempt
			activeAttempt = getActiveAttempt();
		} else {
			// Handle error (could add toast here)
			toast.error('Failed to set custom start date');
			console.error('Failed to set custom start date');
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Description>
				Configure your smoking habits to get accurate statistics and calculations.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Smoking Habits -->
			<div class="space-y-4">
				<h3 class="font-semibold">Smoking Habits</h3>

				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<Label for="cigarettesPerDay">Cigarettes per day (before quitting)</Label>
						<Input id="cigarettesPerDay" type="number" min="1" bind:value={cigarettesPerDay} />
					</div>

					<div>
						<Label for="cigarettesPerPack">Cigarettes per pack</Label>
						<Input id="cigarettesPerPack" type="number" min="1" bind:value={cigarettesPerPack} />
					</div>
				</div>
			</div>

			<!-- Financial Settings -->
			<div class="space-y-4">
				<h3 class="flex items-center gap-2 font-semibold">
					<DollarSign class="size-5" />
					Financial Settings
				</h3>

				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<Label for="pricePerPack">Price per pack</Label>
						<Input id="pricePerPack" type="number" min="0" step="0.01" bind:value={pricePerPack} />
					</div>

					<div>
						<Label for="currency">Currency</Label>
						<Select.Root type="single" bind:value={currency} name="currency">
							<Select.Trigger class="w-full">
								{currency || 'Select currency...'}
							</Select.Trigger>
							<Select.Content>
								{#each currencies as curr}
									<Select.Item value={curr} label={curr}>
										{curr}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</div>

			<!-- Motivational Goals -->
			<div class="space-y-4">
				<h3 class="font-semibold">Your Motivational Goals</h3>
				<p class="text-muted-foreground text-sm">
					Add personal reasons for quitting to keep yourself motivated.
				</p>

				<div class="flex gap-2">
					<Input
						placeholder="e.g., Save for vacation, Improve health..."
						bind:value={newGoal}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addGoal();
							}
						}}
					/>
					<Button type="button" onclick={addGoal}>
						<Plus class="size-4" />
					</Button>
				</div>

				{#if motivationalGoals.length > 0}
					<div class="space-y-2">
						{#each motivationalGoals as goal, index (index)}
							<div class="flex items-center justify-between rounded-lg border p-3">
								<span>{goal}</span>
								<Button variant="ghost" size="sm" onclick={() => removeGoal(index)}>
									<Trash2 class="size-4 text-red-500" />
								</Button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground text-center text-sm">
						No goals added yet. Add your personal motivations above!
					</p>
				{/if}
			</div>

			<!-- Custom Start Date -->
			<div class="space-y-4">
				<h3 class="flex items-center gap-2 font-semibold">
					<Calendar class="size-5" />
					Custom Start Date
				</h3>
				<p class="text-muted-foreground text-sm">
					If you started your smoke-free journey before using this app, enable this feature and set
					the date you actually quit smoking. This will adjust your streak display to show your true
					quit date.
				</p>

				<div class="flex items-center space-x-2">
					<Checkbox id="customStartDateEnabled" bind:checked={customStartDateEnabled} />
					<Label for="customStartDateEnabled" class="text-sm font-medium">
						Enable custom start date
					</Label>
				</div>

				{#if customStartDateEnabled}
					<div class="ml-6 space-y-2">
						<Label for="customStartDate">Quit Date</Label>
						<Input
							id="customStartDate"
							type="date"
							bind:value={customStartDate}
							max={new Date().toISOString().split('T')[0]}
						/>
						<Button
							type="button"
							onclick={handleSetCustomStartDate}
							disabled={!customStartDate}
							variant="outline"
							size="sm"
						>
							Set Custom Start Date
						</Button>
					</div>

					{#if activeAttempt?.customStartDate}
						<div class="bg-muted/50 ml-6 rounded-lg border p-3">
							<p class="text-sm">
								<strong>Current custom start date:</strong>
								{new Date(activeAttempt.customStartDate).toLocaleDateString()}
							</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button onclick={handleSave}>
				<SettingsIcon class="mr-2 size-4" />
				Save Settings
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
