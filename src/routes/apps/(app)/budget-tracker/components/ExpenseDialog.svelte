<script lang="ts">
	import * as Dialog from '@/ui/dialog';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import * as AlertDialog from '@/ui/alert-dialog';
	import { Label } from '@/ui/label';
	import type { Expense } from '../states.svelte';
	import { findBudget } from '../states.svelte';
	import { Pencil, Trash2, Calendar, PlusCircle, Wallet } from '@lucide/svelte';

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
	const isNewExpense = $derived(editingExpense?.expense.id === '');
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
			<Dialog.Title>
				{#if isEditing || isNewExpense}
					<span class="flex items-center gap-2">
						<PlusCircle class="h-5 w-5" /> Add New Expense
					</span>
				{:else}
					<span class="flex items-center gap-2">
						<Wallet class="h-5 w-5" /> Expense Details
					</span>
				{/if}
			</Dialog.Title>
			<Dialog.Description>
				{#if isEditing || isNewExpense}
					Enter the expense details below. Click save when you're done.
				{:else}
					View the expense details below. Click the pencil button to edit.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if editingExpense}
			{#if isEditing || isNewExpense}
				<div class="grid gap-4 py-4">
					<div class="space-y-2">
						<Label for="expense-desc" class="text-sm font-semibold">Description</Label>
						<Input
							id="expense-desc"
							bind:value={editExpenseDescription}
							type="text"
							placeholder="What did you spend on?"
							class="h-10"
						/>
					</div>
					<div class="space-y-2">
						<Label for="expense-amount" class="text-sm font-semibold">Amount</Label>
						<Input
							id="expense-amount"
							bind:value={editExpenseAmount}
							type="number"
							placeholder="0.00"
							inputmode="decimal"
							class="h-10"
						/>
					</div>
					<div class="space-y-2">
						<Label for="expense-formatted" class="text-sm font-semibold">Formatted</Label>
						<Input
							id="expense-formatted"
							value={formatNumber(Number(editExpenseAmount))}
							type="text"
							placeholder="0"
							inputmode="decimal"
							pattern="[0-9,]*"
							disabled
							class="h-10 opacity-75"
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button
						onclick={() => {
							editingExpense = null;
							isEditing = false;
						}}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						onclick={() => {
							updateExpense();
							isEditing = false;
						}}
						class="gap-2"
					>
						{isNewExpense ? '✓ Add Expense' : '✓ Save Changes'}
					</Button>
				</Dialog.Footer>
			{:else}
				<div class="space-y-4 py-4">
					<div class="bg-muted/50 space-y-3 rounded-lg p-4">
						<div>
							<p class="text-muted-foreground text-xs font-medium">Description</p>
							<p class="text-foreground mt-1 text-base font-semibold">
								{editingExpense.expense.description}
							</p>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-muted-foreground text-xs font-medium">Amount</p>
								<p class="text-foreground mt-1 text-lg font-bold">
									{formatNumber(editingExpense.expense.amount)}
									{#if findBudget(editingExpense.budgetId)?.currency}
										<span class="text-muted-foreground text-sm font-normal">
											&nbsp;{findBudget(editingExpense.budgetId)?.currency}
										</span>
									{/if}
								</p>
							</div>
							<div>
								<p class="text-muted-foreground text-xs font-medium">Date</p>
								<p class="text-foreground mt-1 flex items-center gap-1 text-sm font-medium">
									<Calendar class="h-4 w-4" />
									{new Date(editingExpense.expense.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>
				</div>
				<Dialog.Footer>
					<div class="flex w-full items-center justify-between">
						<!-- Left: destructive delete -->
						<AlertDialog.Root
							open={showConfirmDelete}
							onOpenChange={(v) => (showConfirmDelete = v)}
						>
							<AlertDialog.Trigger>
								{#snippet child({ props })}
									<Button {...props} variant="destructive" size="sm" class="gap-2">
										<Trash2 class="h-4 w-4" />
										Delete
									</Button>
								{/snippet}
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Delete Expense?</AlertDialog.Title>
									<AlertDialog.Description>
										This action cannot be undone. The expense will be permanently removed.
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

						<!-- Right: edit + cancel -->
						<div class="flex items-center gap-2">
							<Button onclick={() => (isEditing = true)} variant="outline" size="sm" class="gap-2">
								<Pencil class="h-4 w-4" />
								Edit
							</Button>
							<Button
								onclick={() => {
									editingExpense = null;
									isEditing = false;
								}}
								variant="ghost"
								size="sm"
							>
								Close
							</Button>
						</div>
					</div>
				</Dialog.Footer>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
