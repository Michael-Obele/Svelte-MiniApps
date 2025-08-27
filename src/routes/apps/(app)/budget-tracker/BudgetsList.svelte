<script lang="ts">
	import { Card } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { Progress } from '@/ui/progress/index.js';
	import { Pencil, SquareArrowOutUpRight, Trash2 } from '@lucide/svelte';
	import type { Budget, Expense } from './states.svelte';
	import * as budgetState from './states.svelte';
	import { AlertCircle, AlertTriangle, CheckCircle2 } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';

	interface Props {
		budgets: Budget[];
		openEditDialog: (budget: Budget) => void;
		openEditExpenseDialog: (budgetId: string, expense: Expense) => void;
		getProgressPercentage: (budget: Budget) => number;
		getProgressBarColor: (percentage: number) => string;
		calculateTotalExpenses: (expenses: Expense[]) => number;
		getCurrencySymbol: (currencyCode: string) => string;
		formatNumberWithCommas: (value: string | number) => string;
	}

	let {
		budgets,
		openEditDialog,
		openEditExpenseDialog,
		getProgressPercentage,
		getProgressBarColor,
		calculateTotalExpenses,
		getCurrencySymbol,
		formatNumberWithCommas
	}: Props = $props();

	async function handleDeleteBudget(budgetId: string) {
		const deleteToast = toast.loading('Deleting budget...');
		try {
			const formData = new FormData();
			formData.append('budgetId', budgetId);

			const response = await fetch('?/deleteBudget', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				budgetState.deleteBudget(budgetId);
				toast.success('Budget deleted successfully', { id: deleteToast });
			} else {
				const result = await response.json();
				throw new Error(result.error || 'Failed to delete budget');
			}
		} catch (error) {
			console.error('Error deleting budget:', error);
			toast.error(String(error), { id: deleteToast });
		}
	}

	function getBudgetStatusIconAndColor(percentage: number): { icon: any; color: string } {
		// Returns an object
		if (percentage >= 90) {
			return { icon: AlertCircle, color: 'text-destructive' };
		} else if (percentage > 50) {
			return { icon: AlertTriangle, color: 'text-yellow-500' };
		} else {
			return { icon: CheckCircle2, color: 'text-emerald-500' };
		}
	}
</script>

<div id="budgets-list" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
	{#each budgets as budget}
		<Card id="budget-{budget.id}" class="p-6 transition-all hover:shadow-md">
			{#if budget.expenses}
				{@const percentage = getProgressPercentage(budget)}
				{@const { icon: SvelteComponent, color } = getBudgetStatusIconAndColor(percentage)}

				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<h3 class="text-lg font-semibold">{budget.name}</h3>
						<SvelteComponent class="h-4 w-4 {color}" />
					</div>
					<div class="flex gap-2">
						<Button variant="ghost" size="icon" onclick={() => openEditDialog(budget)}>
							<Pencil class="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => handleDeleteBudget(budget.id)}>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
				</div>
			{/if}
			<!-- Progress Bar -->
			<div class="mb-4">
				<div class="mb-4">
					<Progress
						value={getProgressPercentage(budget)}
						max={100}
						classInner="bg-green-400 transition-all {getProgressBarColor(
							getProgressPercentage(budget)
						)}"
						class="h-3 w-full"
					/>
				</div>

				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span>Budget:</span>
						<span class="font-semibold">
							{getCurrencySymbol(budget.currency)}{formatNumberWithCommas(budget.amount.toString())}
						</span>
					</div>
					<div class="flex justify-between text-sm">
						<span>Spent:</span>
						<span class="font-semibold">
							{getCurrencySymbol(budget.currency)}
							{formatNumberWithCommas(calculateTotalExpenses(budget.expenses))}
						</span>
					</div>
					<div class="flex justify-between text-sm">
						<span>Remaining:</span>
						<span class="font-semibold">
							{getCurrencySymbol(budget.currency)}
							{formatNumberWithCommas(budget.amount - calculateTotalExpenses(budget.expenses))}
						</span>
					</div>
				</div>

				{#if budget.expenses.length > 0}
					<div class="mt-4">
						<h4 class="mb-2 font-semibold">Expenses</h4>
						<div class="space-y-2">
							<ScrollArea class="h-[22rem] rounded-md border p-4 md:h-[18rem]">
								{#each budget.expenses as expense, i}
									<Card
										class="cursor-pointer p-3"
										onclick={() => openEditExpenseDialog(budget.id, expense)}
									>
										<div class="flex items-center justify-between">
											<div class="min-w-0">
												<div class="truncate break-words text-sm font-medium">
													{expense.description}
												</div>
												<div class="truncate text-xs text-muted-foreground">
													{new Date(expense.createdAt).toLocaleDateString()}
												</div>
											</div>
											<div class="ml-4 flex items-center gap-2">
												<div class="font-bold text-green-600">
													{getCurrencySymbol(budget.currency)}{formatNumberWithCommas(
														expense.amount
													)}
												</div>
												<Button variant="ghost" size="icon" class="h-4 w-4">
													<SquareArrowOutUpRight class="size-2" />
												</Button>
											</div>
										</div>
									</Card>
									{#if i + 1 != budget.expenses.length}
										<Separator class="my-2 bg-primary-foreground" />
									{/if}
								{/each}
							</ScrollArea>
						</div>
					</div>
				{/if}
			</div>
		</Card>
	{/each}
</div>
