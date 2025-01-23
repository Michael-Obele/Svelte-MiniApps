<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { Expense } from '@/stores/budgetStore';

	interface Props {
		editingExpense: { budgetId: string; expense: Expense } | null;
		editExpenseDescription: string;
		editExpenseAmount: string;
		updateExpense: () => void;
	}

	let {
		editingExpense = $bindable(),
		editExpenseDescription = $bindable(),
		editExpenseAmount = $bindable(),
		updateExpense
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
			<Input
				bind:value={editExpenseDescription}
				placeholder="Description"
				inputmode="decimal"
				pattern="[0-9,]*"
			/>
			<Input bind:value={editExpenseAmount} type="number" placeholder="Amount" />
		</div>
		<Dialog.Footer>
			<Button onclick={() => (editingExpense = null)} variant="outline">Cancel</Button>
			<Button onclick={updateExpense}>Save Changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
