<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		editingBudget: { id: string; name: string; amount: number; currency: string } | null;
		editBudgetName: string;
		editBudgetAmount: string;
		editBudgetCurrency: string;
		updateBudget: () => void;
		formatNumber: (value: number) => string;
		currencies: { value: string; label: string; symbol: string }[];
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
			<Dialog.Title>Edit Budget</Dialog.Title>
			<Dialog.Description>
				Make changes to your budget here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Input bind:value={editBudgetName} placeholder="Budget Name" />
			<Input
				bind:value={editBudgetAmount}
				type="number"
				placeholder="Budget Amount"
				inputmode="decimal"
				pattern="[0-9,]*"
			/>
			<Input
				value={formatNumber(Number(editBudgetAmount))}
				type="text"
				placeholder="Formated Budget Amount"
				inputmode="decimal"
				pattern="[0-9,]*"
				disabled
			/>
			<Select.Root type="single" bind:value={editBudgetCurrency}>
				<Select.Trigger class="w-full">{editBudgetCurrency}</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.GroupHeading>Currency</Select.GroupHeading>
						{#each currencies as currency}
							<Select.Item value={currency.value}>{currency.label}</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (editingBudget = null)}>Cancel</Button>
			<Button onclick={updateBudget}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
