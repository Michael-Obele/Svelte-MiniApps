<script lang="ts">
	let {
		editingBudget = $bindable(),
		editBudgetName = $bindable(),
		editBudgetAmount = $bindable(),
		editBudgetCurrency = $bindable(),
		updateBudget,
		currencies
	} = $props();
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
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
			<Input bind:value={editBudgetAmount} type="number" placeholder="Amount" />
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
