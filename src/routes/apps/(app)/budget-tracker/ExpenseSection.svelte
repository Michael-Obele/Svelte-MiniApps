<script lang="ts">
	import * as Select from '@/ui/select';
	import * as budgetState from './states.svelte';
	import type { Budget, Expense } from './states.svelte';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Card } from '@/ui/card';
	import { PlusCircle } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Props with proper typing
	interface Props {
		selectedBudgetId: string;
		selectedBudgetName: string;
		expenseDescription: string;
		expenseAmount: string;
		budgets: Budget[];
		formatNumberInput: (event: Event) => void;
	}

	let {
		selectedBudgetId = $bindable(''),
		selectedBudgetName = $bindable('Select Budget'),
		expenseDescription = $bindable(''),
		expenseAmount = $bindable(''),
		budgets = $bindable<Budget[]>([]),
		formatNumberInput
	}: Props = $props();

	// Add expense function
	function addExpense() {
		if (!selectedBudgetId || !expenseDescription || !expenseAmount) {
			toast.error('Please fill in all fields');
			return;
		}

		const formattedAmount = Number(expenseAmount.replace(/,/g, ''));

		// Update the state using our simplified state management
		budgetState.addExpense(selectedBudgetId, expenseDescription, formattedAmount);

		// Show success message
		toast.success('Expense added successfully');

		// Reset form
		expenseDescription = '';
		expenseAmount = '';
		selectedBudgetId = '';
		selectedBudgetName = 'Select Budget';
	}
</script>

<!-- Add Expense Form -->
{#if budgets.length > 0}
	<div class="mt-4">
		<Card class="p-6">
			<h2 class="mb-4 text-xl font-semibold">Add New Expense</h2>
			<div class="flex flex-col gap-4 sm:flex-row">
				<Select.Root
					type="single"
					bind:value={selectedBudgetId}
					onValueChange={(value) => {
						const budget = budgetState.findBudget(value);
						selectedBudgetName = budget ? budget.name : 'Select Budget';
					}}
				>
					<Select.Trigger class="flex-1">{selectedBudgetName}</Select.Trigger>
					<Select.Content>
						{#each budgets as budget}
							<Select.Item value={budget.id}>
								{budget.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Input bind:value={expenseDescription} placeholder="Expense Description" class="flex-1" />
				<Input
					bind:value={expenseAmount}
					type="text"
					placeholder="Amount"
					class="w-32"
					oninput={formatNumberInput}
				/>
			</div>
			<div class="mt-4">
				<Button onclick={addExpense} size="sm" class="gap-2">
					<PlusCircle class="h-4 w-4" />
					Add Expense
				</Button>
			</div>
		</Card>
	</div>
{/if}
