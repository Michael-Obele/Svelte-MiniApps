<script lang="ts">
	import { DollarSign, Settings as SettingsIcon, Plus, Trash2 } from '@lucide/svelte';
	import { Button } from '@/ui/button';
	import * as Dialog from '@/ui/dialog';
	import { Label } from '@/ui/label';
	import { Input } from '@/ui/input';
	import * as Select from '@/ui/select';
	import { userSettings, updateSettings } from './states.svelte';

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

	const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'NGN'];

	function handleSave() {
		updateSettings({
			cigarettesPerDay,
			pricePerPack,
			cigarettesPerPack,
			currency,
			motivationalGoals
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
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl">
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
						<Input
							id="cigarettesPerDay"
							type="number"
							min="1"
							bind:value={cigarettesPerDay}
						/>
					</div>

					<div>
						<Label for="cigarettesPerPack">Cigarettes per pack</Label>
						<Input
							id="cigarettesPerPack"
							type="number"
							min="1"
							bind:value={cigarettesPerPack}
						/>
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
						<Input
							id="pricePerPack"
							type="number"
							min="0"
							step="0.01"
							bind:value={pricePerPack}
						/>
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
				<p class="text-sm text-muted-foreground">
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
					<p class="text-center text-sm text-muted-foreground">
						No goals added yet. Add your personal motivations above!
					</p>
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
