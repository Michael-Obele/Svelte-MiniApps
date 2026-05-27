<script lang="ts">
	import { Card } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { Progress } from '@/ui/progress';
	import * as DropdownMenu from '@/ui/dropdown-menu';
	import { EllipsisVertical, Plus, Pencil, Eye, Trash2, ArrowRight } from '@lucide/svelte';
	import type { Budget } from '../states.svelte';

	interface Props {
		budget: Budget;
		formatNumber: (value: number) => string;
		onAddExpense: () => void;
		onEdit: () => void;
		onView: () => void;
		onDelete: () => void;
	}

	let { budget, formatNumber, onAddExpense, onEdit, onView, onDelete }: Props = $props();

	// Calculate spent amount
	const spent = $derived(budget.expenses.reduce((sum, exp) => sum + exp.amount, 0));
	const remaining = $derived(budget.amount - spent);
	const percentUsed = $derived(Math.min((spent / budget.amount) * 100, 100));
	const isOverBudget = $derived(spent > budget.amount);
	const statusColor = $derived(
		percentUsed >= 90 ? 'destructive' : percentUsed >= 50 ? 'warning' : 'success'
	);
</script>

<Card class="transition-all duration-200 hover:shadow-md dark:hover:shadow-lg">
	<div class="space-y-4 p-5">
		<!-- Header with budget name and dropdown -->
		<div class="flex items-start justify-between gap-2">
			<div class="min-w-0 flex-1">
				<h3 class="text-foreground truncate text-base font-semibold">{budget.name}</h3>
				<p class="text-muted-foreground mt-0.5 text-xs">{budget.currency}</p>
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="h-8 w-8 flex-shrink-0">
							<EllipsisVertical class="h-4 w-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item onclick={onAddExpense}>
						<Plus class="mr-2 h-4 w-4" />
						Add Expense
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={onEdit}>
						<Pencil class="mr-2 h-4 w-4" />
						Edit Budget
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={onView}>
						<Eye class="mr-2 h-4 w-4" />
						View Details
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={onDelete} class="text-destructive focus:text-destructive">
						<Trash2 class="mr-2 h-4 w-4" />
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Amount display grid -->
		<div class="grid grid-cols-3 gap-3">
			<div class="bg-muted/40 space-y-1 rounded-md p-3">
				<p class="text-muted-foreground text-xs font-medium">Budget</p>
				<p class="text-foreground text-sm font-bold">{formatNumber(budget.amount)}</p>
			</div>
			<div class="bg-muted/40 space-y-1 rounded-md p-3">
				<p class="text-muted-foreground text-xs font-medium">Spent</p>
				<p class={`text-sm font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
					{formatNumber(spent)}
				</p>
			</div>
			<div class="bg-muted/40 space-y-1 rounded-md p-3">
				<p class="text-muted-foreground text-xs font-medium">Left</p>
				<p class={`text-sm font-bold ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
					{formatNumber(Math.max(remaining, 0))}
				</p>
			</div>
		</div>

		<!-- Progress bar section -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<p class="text-muted-foreground text-xs font-medium">Progress</p>
				<p class={`text-xs font-semibold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
					{percentUsed.toFixed(0)}%
				</p>
			</div>
			<Progress value={percentUsed} class="h-2.5" />
		</div>

		<!-- Quick stats and action -->
		<div class="flex items-center justify-between pt-1">
			<div class="text-muted-foreground text-xs">
				{budget.expenses.length} expense{budget.expenses.length !== 1 ? 's' : ''}
			</div>
			<Button
				href={`/apps/budget-tracker/${budget.id}`}
				size="sm"
				variant="outline"
				class="gap-1.5 text-xs"
			>
				View Details <ArrowRight class="h-3.5 w-3.5" />
			</Button>
		</div>
	</div>
</Card>
