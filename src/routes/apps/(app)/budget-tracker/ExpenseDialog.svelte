<script lang="ts">
	import * as Dialog from '@/ui/dialog';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import type { Expense } from './states.svelte';

	interface Props {
		editingExpense: { budgetId: string; expense: Expense } | null;
		editExpenseDescription: string;
		editExpenseAmount: string;
		updateExpense: () => void;
		formatNumber: (value: number) => string;
	}

	let {
		editingExpense = $bindable(),
		editExpenseDescription = $bindable(),
		editExpenseAmount = $bindable(),
		updateExpense,
		formatNumber
	}: Props = $props();
</script>

<Dialog.Root open={!!editingExpense} onOpenChange={(open) => !open && (editingExpense = null)}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Expense</Dialog.Title>
			<Dialog.Description>
				Make changes to the expense here. Click save when you're done.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Input bind:value={editExpenseDescription} type="text" placeholder="Description" />
			<Input bind:value={editExpenseAmount} type="number" placeholder="Amount" />
			<Input
				value={formatNumber(Number(editExpenseAmount))}
				type="text"
				placeholder="Formatted Amount"
				inputmode="decimal"
				pattern="[0-9,]*"
				disabled
			/>
		</div>
		<Dialog.Footer>
			<Button onclick={() => (editingExpense = null)} variant="outline">Cancel</Button>
			<Button onclick={updateExpense}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
