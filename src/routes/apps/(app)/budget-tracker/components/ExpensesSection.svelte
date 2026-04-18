<script lang="ts">
	import { Card } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { Pencil, Plus, ReceiptText, Trash2 } from '@lucide/svelte';
	import type { Budget, Expense } from '../states.svelte';

	interface Props {
		budget: Budget;
		formatNumber: (value: number) => string;
		onAddExpense: () => void;
		onEdit: (budgetId: string, expense: Expense) => void;
		onDelete: (budgetId: string, expenseId: string) => void;
	}

	let { budget, formatNumber, onAddExpense, onEdit, onDelete }: Props = $props();

	// Display expenses in reverse order (most recent first)
	const displayedExpenses = $derived([...budget.expenses].reverse());

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<Card class="p-4 sm:p-5">
	<div class="space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3">
				<div class="bg-muted rounded-lg p-2">
					<ReceiptText class="text-foreground h-4 w-4" />
				</div>
				<div>
					<h3 class="text-sm font-semibold">Expenses ({budget.expenses.length})</h3>
					<p class="text-muted-foreground text-xs">Every logged item for this budget</p>
				</div>
			</div>
			<Button size="sm" onclick={onAddExpense} class="gap-2 sm:self-start">
				<Plus class="h-4 w-4" />
				Add Expense
			</Button>
		</div>

		{#if displayedExpenses.length === 0}
			<div class="bg-muted flex h-32 items-center justify-center rounded-lg">
				<p class="text-muted-foreground text-sm">No expenses yet</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each displayedExpenses as expense (expense.id)}
					<div
						class="border-border bg-card hover:bg-muted/50 flex items-center justify-between rounded-2xl border p-3 transition-colors"
					>
						<div class="min-w-0 flex-1">
							<p class="text-foreground truncate text-sm font-medium">{expense.description}</p>
							<p class="text-muted-foreground text-xs">{formatDate(expense.createdAt)}</p>
						</div>
						<div class="flex items-center gap-3">
							<div class="text-right">
								<p class="text-foreground text-sm font-semibold">{formatNumber(expense.amount)}</p>
								{#if expense.isCompleted}
									<p class="text-muted-foreground text-xs line-through">Completed</p>
								{/if}
							</div>
							<div class="flex gap-1">
								<Button
									size="sm"
									variant="ghost"
									onclick={() => onEdit(budget.id, expense)}
									class="h-8 w-8 cursor-pointer p-0"
									title="Edit expense"
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onclick={() => onDelete(budget.id, expense.id)}
									class="text-destructive hover:bg-destructive/10 h-8 w-8 cursor-pointer p-0"
									title="Delete expense"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Card>
