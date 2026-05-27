<script lang="ts">
	import * as Dialog from '@/ui/dialog';
	import { Input } from '@/ui/input';
	import * as Select from '@/ui/select';
	import { Button } from '@/ui/button';
	import { Label } from '@/ui/label';
	import { ChartBar } from '@lucide/svelte';

	interface Props {
		editingBudget: { id: string; name: string; amount: number; currency: string } | null;
		editBudgetName: string;
		editBudgetAmount: string;
		editBudgetCurrency: string;
		updateBudget: () => void;
		formatNumber: (value: number) => string;
		currencies: { value: string; label: string; symbol: string; icon?: string }[];
	}

	let {
		editingBudget = $bindable(),
		editBudgetName = $bindable(),
		editBudgetAmount = $bindable(),
		editBudgetCurrency = $bindable(),
		updateBudget,
		formatNumber,
		currencies
	}: Props = $props();
</script>

<Dialog.Root open={!!editingBudget} onOpenChange={(open) => !open && (editingBudget = null)}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<ChartBar class="h-5 w-5" /> Edit Budget
			</Dialog.Title>
			<Dialog.Description>
				Update your budget details. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="space-y-2">
				<Label for="edit-budget-name" class="text-sm font-semibold">Budget Name</Label>
				<Input
					id="edit-budget-name"
					type="text"
					bind:value={editBudgetName}
					placeholder="Budget Name"
					class="h-10"
				/>
			</div>
			<div class="space-y-2">
				<Label for="edit-budget-amount" class="text-sm font-semibold">Budget Amount</Label>
				<Input
					id="edit-budget-amount"
					bind:value={editBudgetAmount}
					type="number"
					placeholder="Budget Amount"
					inputmode="decimal"
					pattern="[0-9,]*"
					class="h-10"
				/>
			</div>
			<div class="space-y-2">
				<Label for="edit-budget-formatted" class="text-sm font-semibold">Formatted Amount</Label>
				<Input
					id="edit-budget-formatted"
					value={formatNumber(Number(editBudgetAmount))}
					type="text"
					placeholder="Formated Budget Amount"
					inputmode="decimal"
					pattern="[0-9,]*"
					disabled
					class="h-10 opacity-75"
				/>
			</div>
			<div class="space-y-2">
				<Label for="edit-budget-currency" class="text-sm font-semibold">Currency</Label>
				<Select.Root type="single" bind:value={editBudgetCurrency}>
					<Select.Trigger id="edit-budget-currency" class="h-10"
						>{editBudgetCurrency}</Select.Trigger
					>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Select Currency</Select.GroupHeading>
							{#each currencies as currency}
								<Select.Item value={currency.value} label={currency.label}>
									{#if currency.icon}
										<img src={currency.icon} alt={currency.symbol} class="mr-2 inline h-4 w-4" />
									{/if}
									{currency.label}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (editingBudget = null)}>Cancel</Button>
			<Button onclick={updateBudget} class="gap-2">✓ Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
