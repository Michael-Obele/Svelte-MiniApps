<script lang="ts">
	import { Button } from '@/ui/button';
	import { Progress } from '@/ui/progress';
	import {
		ChartColumn,
		ChevronLeft,
		CircleDollarSign,
		Globe,
		PiggyBank,
		ReceiptText,
		Shield
	} from '@lucide/svelte';
	import QuickStatsGrid from '@/budget-tracker/QuickStatsGrid.svelte';
	import CategoryChart from '@/budget-tracker/Charts/CategoryChart.svelte';
	import TrendChart from '@/budget-tracker/Charts/TrendChart.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const budget = $derived(data.budget);

	function formatNumber(value: number): string {
		return value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	const totalSpent = $derived(budget.expenses.reduce((sum, expense) => sum + expense.amount, 0));
	const remaining = $derived(Math.max(budget.amount - totalSpent, 0));
	const percentUsed = $derived(
		budget.amount > 0 ? Math.min((totalSpent / budget.amount) * 100, 100) : 0
	);
	const expenseCount = $derived(budget.expenses.length);
	const isOverBudget = $derived(totalSpent > budget.amount);
	const healthLabel = $derived(
		isOverBudget ? 'Over budget' : percentUsed >= 80 ? 'Approaching limit' : 'On track'
	);
	const pageTitle = $derived(`${budget.name} | Shared Budget`);
	const pageDescription = $derived(
		`View a shared read-only budget for ${budget.name} in Svelte Mini Apps.`
	);

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="robots" content="noindex,nofollow" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
</svelte:head>

<div class="space-y-6">
	<Button href="/apps/budget-tracker" variant="ghost" size="sm" class="gap-2 pl-0">
		<ChevronLeft class="h-4 w-4" />
		Back to Budget Tracker
	</Button>

	<section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
		<div class="bg-card rounded-3xl border p-6 shadow-sm sm:p-7">
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
				>
					<PiggyBank class="h-3.5 w-3.5" />
					{budget.currency} budget
				</span>
				<span
					class="text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
				>
					<ReceiptText class="h-3.5 w-3.5" />
					{expenseCount}
					{expenseCount === 1 ? 'expense' : 'expenses'}
				</span>
				<span
					class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
				>
					<Globe class="h-3.5 w-3.5" />
					Read-only link
				</span>
			</div>

			<div class="mt-5 space-y-2">
				<h1 class="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
					{budget.name}
				</h1>
				<p class="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">
					This shared budget is view only. You can review spend, trends, and logged expenses, but
					editing stays with the owner.
				</p>
			</div>

			<div class="mt-6 grid gap-3 sm:grid-cols-3">
				<div class="bg-muted/20 rounded-2xl border p-4">
					<div
						class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
					>
						<CircleDollarSign class="h-3.5 w-3.5" />
						Budget amount
					</div>
					<p class="text-foreground mt-2 text-sm font-semibold">{formatNumber(budget.amount)}</p>
					<p class="text-muted-foreground mt-1 text-xs">Original allocation</p>
				</div>
				<div class="bg-muted/20 rounded-2xl border p-4">
					<div
						class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
					>
						<ReceiptText class="h-3.5 w-3.5" />
						Latest activity
					</div>
					<p class="text-foreground mt-2 text-sm font-semibold">
						{budget.expenses[0] ? formatDate(budget.expenses[0].createdAt) : 'No activity yet'}
					</p>
					<p class="text-muted-foreground mt-1 text-xs">Most recent expense logged</p>
				</div>
				<div class="bg-muted/20 rounded-2xl border p-4">
					<div
						class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
					>
						<ChartColumn class="h-3.5 w-3.5" />
						Coverage
					</div>
					<p class="text-foreground mt-2 text-sm font-semibold">
						{percentUsed.toFixed(0)}% of this budget is already used
					</p>
					<p class="text-muted-foreground mt-1 text-xs">Useful context for pacing spend</p>
				</div>
			</div>
		</div>

		<aside class="bg-card rounded-3xl border p-5 shadow-sm">
			<p class="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
				Budget Health
			</p>
			<div class="mt-3 space-y-1">
				<p class="text-foreground text-2xl font-semibold">{formatNumber(remaining)}</p>
				<p class="text-muted-foreground text-sm">Remaining before the budget cap is reached</p>
			</div>

			<div class="mt-5 space-y-2">
				<div class="text-muted-foreground flex items-center justify-between text-xs font-medium">
					<span>Used</span>
					<span>{percentUsed.toFixed(1)}%</span>
				</div>
				<Progress value={percentUsed} class="h-2.5" />
			</div>

			<div class="mt-5 rounded-2xl border p-4">
				<div class="flex items-start gap-3">
					<div class="bg-muted rounded-xl p-2">
						<Shield class="text-foreground h-4 w-4" />
					</div>
					<div>
						<p class="text-foreground text-sm font-medium">{healthLabel}</p>
						<p class="text-muted-foreground mt-1 text-xs leading-5">
							Shared links are view only. No edits, deletes, or new expenses can be made from this
							page.
						</p>
					</div>
				</div>
			</div>
		</aside>
	</section>

	<QuickStatsGrid {budget} {formatNumber} />

	<div class="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
		<CategoryChart expenses={budget.expenses} {formatNumber} />
		<TrendChart expenses={budget.expenses} {formatNumber} />
	</div>

	<section class="bg-card rounded-3xl border p-5 shadow-sm">
		<div class="flex items-start justify-between gap-3">
			<div>
				<h2 class="text-foreground text-lg font-semibold">Expense log</h2>
				<p class="text-muted-foreground mt-1 text-sm">
					Line items recorded for this shared budget.
				</p>
			</div>
			<span class="text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium">
				View only
			</span>
		</div>

		{#if budget.expenses.length === 0}
			<div class="bg-muted mt-4 flex h-32 items-center justify-center rounded-2xl">
				<p class="text-muted-foreground text-sm">No expenses have been logged yet.</p>
			</div>
		{:else}
			<div class="mt-4 space-y-2">
				{#each budget.expenses as expense (expense.id)}
					<div class="bg-muted/20 rounded-2xl border p-4">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<p class="text-foreground truncate text-sm font-medium">{expense.description}</p>
								<p class="text-muted-foreground mt-1 text-xs">{formatDate(expense.createdAt)}</p>
							</div>
							<p class="text-foreground flex-shrink-0 text-sm font-semibold">
								{formatNumber(expense.amount)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
