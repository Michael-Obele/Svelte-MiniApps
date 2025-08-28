<script lang="ts">
	import { Card } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { Progress } from '@/ui/progress/index.js';
	import { Pencil, SquareArrowOutUpRight, Trash2 } from '@lucide/svelte';
	import type { Budget, Expense } from './states.svelte';
	import * as budgetState from './states.svelte';
	import { AlertCircle, AlertTriangle, CheckCircle2, Circle } from '@lucide/svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { Switch } from '@/ui/switch';
	import { Label } from '@/ui/label';

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

	// Get per-budget strikethrough modes state
	let budgetStrikethroughModes = $state(budgetState.budgetStrikethroughModes.current);

	// Subscribe to per-budget strikethrough modes changes
	$effect(() => {
		const unsubscribe = budgetState.budgetStrikethroughModes.subscribe((value) => {
			budgetStrikethroughModes = value;
		});
		return unsubscribe;
	});

	// Get selected expenses state
	let selectedExpenses = $state(budgetState.selectedExpenses.current);

	// Subscribe to selected expenses changes
	$effect(() => {
		const unsubscribe = budgetState.selectedExpenses.subscribe((value) => {
			selectedExpenses = value;
		});
		return unsubscribe;
	});

	// Function to calculate expenses that count toward "spent" amount for a specific budget
	function calculateActiveExpenses(expenses: Expense[], budgetId: string): number {
		const strikethroughEnabled = budgetStrikethroughModes[budgetId] ?? false;
		if (!strikethroughEnabled) {
			// When strikethrough is disabled, all expenses count toward spent amount
			return calculateTotalExpenses(expenses);
		}
		// When strikethrough is enabled, only completed (struck out) expenses count toward spent amount
		return expenses
			.filter((expense) => expense.isCompleted ?? false)
			.reduce((total, expense) => total + parseFloat(expense.amount.toString()), 0);
	}

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

<div
	id="budgets-list"
	class="mx-auto grid w-full min-w-[10rem] max-w-7xl flex-wrap justify-center gap-3 px-2 sm:grid-cols-2 sm:gap-4 sm:px-4 md:grid-cols-3"
>
	{#each budgets as budget}
		{@const budgetStrikethroughEnabled = budgetStrikethroughModes[budget.id] ?? false}
		{@const activeExpenses = calculateActiveExpenses(budget.expenses, budget.id)}
		{@const percentage = (activeExpenses / budget.amount) * 100}
		<Card id="budget-{budget.id}" class="min-w-0 p-3 transition-all hover:shadow-md sm:p-4 lg:p-6">
			{#if budget.expenses}
				{@const { icon: Icon, color } = getBudgetStatusIconAndColor(percentage)}

				<!-- Strikethrough Switch -->
				<div class="mb-3 flex items-center justify-between border-b pb-2">
					<div class="flex items-center gap-2">
						<Label for="strikethrough-switch-{budget.id}" class="text-sm font-medium">
							Strike out completed expenses
						</Label>
						<Switch
							id="strikethrough-switch-{budget.id}"
							checked={budgetStrikethroughEnabled}
							onCheckedChange={(checked) =>
								budgetState.budgetStrikethroughModes.setBudgetMode(budget.id, checked)}
						/>
					</div>
				</div>

				<div class="mb-3 flex items-center justify-between sm:mb-4">
					<div class="flex items-center gap-2">
						<h3 class="truncate text-base font-semibold sm:text-lg">{budget.name}</h3>
						<Icon class="h-4 w-4 {color} flex-shrink-0" />
					</div>
					<div class="flex gap-1 sm:gap-2">
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 sm:h-9 sm:w-9"
							onclick={() => openEditDialog(budget)}
						>
							<Pencil class="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="h-8 w-8 sm:h-9 sm:w-9"
							onclick={() => handleDeleteBudget(budget.id)}
						>
							<Trash2 class="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
					</div>
				</div>
			{/if}
			<!-- Progress Bar -->
			<div class="mb-4">
				<div class="mb-4">
					<Progress
						value={percentage}
						max={100}
						classInner="bg-green-400 transition-all {getProgressBarColor(percentage)}"
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
							{getCurrencySymbol(budget.currency)}{formatNumberWithCommas(
								activeExpenses.toString()
							)}
						</span>
					</div>
					<div class="flex justify-between text-sm">
						<span>Remaining:</span>
						<span class="font-semibold">
							{getCurrencySymbol(budget.currency)}
							{formatNumberWithCommas((budget.amount - activeExpenses).toString())}
						</span>
					</div>
				</div>

				{#if budget.expenses.length > 0}
					<div class="mt-4">
						<h4 class="mb-2 font-semibold">Expenses</h4>
						<div class="space-y-2">
							<ScrollArea class=" h-64 rounded-md border p-2 sm:p-3">
								{#each budget.expenses as expense, i}
									{@const isCompleted = expense.isCompleted ?? false}
									{@const isSelected = selectedExpenses.includes(expense.id)}
									<Card
										class="cursor-pointer p-2 transition-all sm:p-3 {isSelected
											? 'ring-2 ring-primary'
											: ''} {budgetStrikethroughEnabled && isCompleted ? 'opacity-70' : ''}"
										onclick={(e) => {
											if (budgetStrikethroughEnabled) {
												e.stopPropagation();
												budgetState.toggleExpenseCompletion(budget.id, expense.id);
											} else {
												openEditExpenseDialog(budget.id, expense);
											}
										}}
									>
										<div class="flex items-center justify-between">
											<div class="min-w-0 flex-1">
												<div
													class="truncate break-words text-sm font-medium {budgetStrikethroughEnabled &&
													isCompleted
														? 'line-through'
														: ''}"
												>
													{expense.description}
												</div>
												<div class="truncate text-xs text-muted-foreground">
													{new Date(expense.createdAt).toLocaleDateString()}
												</div>
											</div>
											<div class="ml-2 flex items-center gap-1 sm:gap-2">
												<div
													class="text-right text-xs font-bold text-green-600 sm:text-sm {budgetStrikethroughEnabled &&
													isCompleted
														? 'line-through'
														: ''}"
												>
													{getCurrencySymbol(budget.currency)}{formatNumberWithCommas(
														expense.amount
													)}
												</div>
												{#if !budgetStrikethroughEnabled}
													<Button variant="ghost" size="icon" class="h-6 w-6 sm:h-8 sm:w-8">
														<SquareArrowOutUpRight class="h-3 w-3 sm:h-4 sm:w-4" />
													</Button>
												{:else}
													<div class="flex h-6 w-6 items-center justify-center sm:h-8 sm:w-8">
														{#if isCompleted}
															<CheckCircle2 class="h-4 w-4 text-green-600" />
														{:else}
															<Circle class="h-4 w-4 text-gray-400" />
														{/if}
													</div>
												{/if}
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
