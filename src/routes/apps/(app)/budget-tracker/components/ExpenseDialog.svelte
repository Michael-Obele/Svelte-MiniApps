<script lang="ts">
	import * as Dialog from '@/ui/dialog';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import * as AlertDialog from '@/ui/alert-dialog';
	import type { Expense } from '../states.svelte';
	import { findBudget } from '../states.svelte';
	import { Bolt } from '@lucide/svelte';

	interface Props {
		editingExpense: { budgetId: string; expense: Expense } | null;
		editExpenseDescription: string;
		editExpenseAmount: string;
		updateExpense: () => void;
		deleteExpense?: (budgetId: string, expenseId: string) => void;
		formatNumber: (value: number) => string;
	}

	let {
		editingExpense = $bindable(),
		editExpenseDescription = $bindable(),
		editExpenseAmount = $bindable(),
		updateExpense,
		deleteExpense,
		formatNumber
	}: Props = $props();

	// local UI state: are we showing the editable inputs or just details?
	let isEditing = $state(false);
	let showConfirmDelete = $state(false);
</script>

<Dialog.Root
	open={!!editingExpense}
	onOpenChange={(open) => {
		if (!open) {
			editingExpense = null;
			isEditing = false;
		}
	}}
>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Expense' : 'Expense Details'}</Dialog.Title>
			<Dialog.Description>
				{#if isEditing}
					Make changes to the expense here. Click save when you're done.
				{:else}
					View the expense details below. Click the pencil button to edit.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if editingExpense}
			{#if isEditing}
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
					<Button onclick={() => (isEditing = false)} variant="outline">Cancel</Button>
					<Button
						onclick={() => {
							updateExpense();
							isEditing = false;
						}}>Save Changes</Button
					>
				</Dialog.Footer>
			{:else}
				<div class="space-y-3 py-4">
					<div>
						<div class="text-muted-foreground text-sm">Description</div>
						<div class="text-base font-medium">{editingExpense.expense.description}</div>
					</div>
					<div>
						<div class="text-muted-foreground text-sm">Amount</div>
						<div class="text-base font-medium">
							{formatNumber(editingExpense.expense.amount)}
							{#if findBudget(editingExpense.budgetId)?.currency}
								<span class="text-muted-foreground text-sm"
									>&nbsp;({findBudget(editingExpense.budgetId)?.currency})</span
								>
							{/if}
						</div>
					</div>
					<div>
						<div class="text-muted-foreground text-sm">Date</div>
						<div class="text-xs">{new Date(editingExpense.expense.createdAt).toLocaleString()}</div>
					</div>
				</div>
				<Dialog.Footer>
					<div class="flex w-full items-center justify-between">
						<!-- Left: destructive delete -->
						<div>
							<AlertDialog.Root
								open={showConfirmDelete}
								onOpenChange={(v) => (showConfirmDelete = v)}
							>
								<AlertDialog.Trigger>
									<Button variant="destructive" onclick={() => (showConfirmDelete = true)}
										>Delete</Button
									>
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Delete Expense</AlertDialog.Title>
										<AlertDialog.Description>
											This action cannot be undone. Are you sure you want to delete this expense?
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										<AlertDialog.Action
											onclick={() => {
												if (!editingExpense) return;
												if (deleteExpense)
													deleteExpense(editingExpense.budgetId, editingExpense.expense.id);
												editingExpense = null;
												showConfirmDelete = false;
											}}
										>
											Delete
										</AlertDialog.Action>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</div>

						<!-- Right: edit + cancel -->
						<div class="flex items-center gap-2">
							<Button onclick={() => (isEditing = true)} variant="ghost">
								<Bolt class="h-4 w-4" />
								Edit
							</Button>
							<Button
								onclick={() => {
									editingExpense = null;
									isEditing = false;
								}}
								variant="outline">Cancel</Button
							>
						</div>
					</div>
				</Dialog.Footer>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
