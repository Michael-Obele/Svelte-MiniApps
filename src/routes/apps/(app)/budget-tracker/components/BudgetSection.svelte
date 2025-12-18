<script lang="ts">
	import * as Select from '@/ui/select';
	import type { Budget } from '../states.svelte';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Card } from '@/ui/card';
	import { PlusCircle } from '@lucide/svelte';

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
	<!-- Add Budget Form -->
	<Card class="p-6">
		<h2 class="mb-4 text-xl font-semibold">Add New Budget</h2>
		<div class="flex flex-col gap-4 sm:flex-row">
			<Input bind:value={budgetName} placeholder="Budget Name" class="flex-1" />

			<Input bind:value={budgetAmount} type="number" placeholder="Amount" class="w-40" />
			<Input
				value={formatNumber(Number(budgetAmount))}
				type="text"
				placeholder="Formated Budget Amount"
				inputmode="decimal"
				pattern="[0-9,]*"
				disabled
				class="w-40"
			/>

			<Select.Root type="single" bind:value={selectedCurrency}>
				<Select.Trigger class="w-[180px]">{selectedCurrency}</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.GroupHeading>Currency</Select.GroupHeading>
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
		<div class="mt-4">
			<Button onclick={addBudget} size="sm" class="gap-2">
				<PlusCircle class="h-4 w-4" />
				Add Budget
			</Button>
		</div>
	</Card>
</section>
