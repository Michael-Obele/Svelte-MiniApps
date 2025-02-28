<script lang="ts">
	import * as Select from '@/ui/select';
	import { budgetStore } from '$lib/stores/budgetStore';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Card } from '@/ui/card';
	import { PlusCircle, Trash2 } from 'lucide-svelte';

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
		formatNumberInput,
		addExpense,
		formsSection = $bindable()
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
			<Input
				bind:value={budgetAmount}
				type="text"
				placeholder="Amount"
				class="w-32"
				oninput={formatNumberInput}
			/>
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
			<Input
				bind:value={expenseAmount}
				type="text"
				placeholder="Amount"
				class="w-32"
				oninput={formatNumberInput}
			/>
			<Button onclick={addExpense}>
				<PlusCircle class="mr-2 h-4 w-4" />
				Add Expense
			</Button>
		</div>
	</Card>
</section>
