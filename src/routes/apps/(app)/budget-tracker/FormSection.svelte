<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { budgetStore, type Budget, type Expense } from '$lib/stores/budgetStore';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Card } from '$lib/components/ui/card';
	import { PlusCircle, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let {
		budgetName = $bindable(),
		budgetAmount = $bindable(),
		selectedBudgetId = $bindable(),
		selectedBudgetName = $bindable('Select Budget'),
		expenseDescription = $bindable(),
		expenseAmount = $bindable(),
		selectedCurrency = $bindable('USD'),
		currencies,
		addBudget,
		addExpense,
		formsSection
	} = $props();

	$effect(() => {
		budgetStore.loadBudgets();
	});
</script>

<section bind:this={formsSection}>
	<!-- Add Budget Form -->
	<Card class="p-6">
		<h2 class="mb-4 text-xl font-semibold">Add New Budget</h2>
		<div class="flex flex-col gap-4 sm:flex-row">
			<Input bind:value={budgetName} placeholder="Budget Name" class="flex-1" />
			<Input bind:value={budgetAmount} type="number" placeholder="Amount" class="w-32" />
			<Select.Root type="single" bind:value={selectedCurrency}>
				<Select.Trigger class="w-[180px]">{selectedCurrency}</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.GroupHeading>Currency</Select.GroupHeading>
						{#each currencies as currency}
							<Select.Item value={currency.value} label={currency.label}
								>{currency.label}</Select.Item
							>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<Button onclick={addBudget}>
				<PlusCircle class="mr-2 h-4 w-4" />
				Add Budget
			</Button>
		</div>
	</Card>

	<!-- Add Expense Form -->
	<Card class="p-6">
		<h2 class="mb-4 text-xl font-semibold">Add Expense</h2>
		<div class="flex flex-col gap-4 sm:flex-row">
			<Select.Root
				type="single"
				bind:value={selectedBudgetId}
				onValueChange={(value) => {
					const budget = $budgetStore.find((b) => b.id === value);
					console.log('budget:', budget);
					selectedBudgetName = budget ? budget.name : 'Select Budget';
				}}
			>
				<Select.Trigger class="flex-1">{selectedBudgetName}</Select.Trigger>
				<Select.Content>
					{#each $budgetStore as budget}
						<Select.Item value={budget.id}>
							{budget.name}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Input bind:value={expenseDescription} placeholder="Description" class="flex-1" />
			<Input bind:value={expenseAmount} type="number" placeholder="Amount" class="w-32" />
			<Button onclick={addExpense}>
				<PlusCircle class="mr-2 h-4 w-4" />
				Add Expense
			</Button>
		</div>
	</Card>
</section>
