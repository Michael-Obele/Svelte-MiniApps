<script lang="ts">
	import * as Select from '@/ui/select';
	import type { Budget } from '../states.svelte';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Card } from '@/ui/card';
	import { PlusCircle, Wallet } from '@lucide/svelte';
	import { Label } from '@/ui/label';

	let {
		budgetName = $bindable(),
		budgetAmount = $bindable(),
		selectedCurrency = $bindable('USD'),
		currencies = $bindable<{ value: string; label: string; symbol: string; icon?: string }[]>(),
		addBudget,
		formatNumber,
		formsSection = $bindable(),
		budgets = $bindable<Budget[]>([])
	} = $props();
</script>

<section id="budget-form" bind:this={formsSection}>
	<Card class="p-6 md:p-8">
		<div class="mb-6 flex items-center gap-3">
			<div class="bg-muted rounded-lg p-2">
				<Wallet class="text-foreground h-5 w-5" />
			</div>
			<div>
				<h2 class="text-foreground text-xl font-bold">Create New Budget</h2>
				<p class="text-muted-foreground text-xs">Set up a budget to track your spending</p>
			</div>
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
			<div class="md:col-span-2 lg:col-span-1">
				<Label for="budget-name" class="mb-2 block text-xs font-semibold">Budget Name</Label>
				<Input
					id="budget-name"
					bind:value={budgetName}
					placeholder="e.g., Groceries"
					class="h-10"
				/>
			</div>

			<div class="md:col-span-2 lg:col-span-1">
				<Label for="budget-amount" class="mb-2 block text-xs font-semibold">Amount</Label>
				<Input
					id="budget-amount"
					bind:value={budgetAmount}
					type="number"
					placeholder="0.00"
					inputmode="decimal"
					class="h-10"
				/>
			</div>

			<div class="md:col-span-2 lg:col-span-1">
				<Label for="budget-formatted" class="mb-2 block text-xs font-semibold">Formatted</Label>
				<Input
					id="budget-formatted"
					value={formatNumber(Number(budgetAmount))}
					type="text"
					placeholder="0"
					disabled
					class="h-10 opacity-75"
				/>
			</div>

			<div class="md:col-span-2 lg:col-span-1">
				<Label for="budget-currency" class="mb-2 block text-xs font-semibold">Currency</Label>
				<Select.Root type="single" bind:value={selectedCurrency}>
					<Select.Trigger id="budget-currency" class="h-10">{selectedCurrency}</Select.Trigger>
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

			<div class="flex items-end md:col-span-2 lg:col-span-1">
				<Button onclick={addBudget} class="h-10 w-full gap-2">
					<PlusCircle class="h-4 w-4" />
					<span class="hidden sm:inline">Add</span>
				</Button>
			</div>
		</div>
	</Card>
</section>
