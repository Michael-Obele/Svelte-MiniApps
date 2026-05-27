<script lang="ts">
	import { Button } from '@/ui/button';
	import { Switch } from '@/ui/switch';
	import { Progress } from '@/ui/progress';
	import {
		CalendarRange,
		ChartColumnBig,
		ChevronLeft,
		Copy,
		CircleDollarSign,
		CloudUpload,
		CloudCheck,
		Eye,
		Globe,
		Lock,
		Loader2,
		Pencil,
		PiggyBank,
		Plus,
		RefreshCcw,
		ReceiptText
	} from '@lucide/svelte';
	import * as Tabs from '@/ui/tabs';
	import QuickStatsGrid from '@/budget-tracker/QuickStatsGrid.svelte';
	import ComparisonChart from '@/budget-tracker/Charts/ComparisonChart.svelte';
	import TrendChart from '@/budget-tracker/Charts/TrendChart.svelte';
	import ExpensesSection from '@/budget-tracker/ExpensesSection.svelte';
	import * as budgetState from '$lib/budget-tracker/states.svelte';
	import type { Budget, Expense } from '$lib/budget-tracker/states.svelte';
	import { toast } from 'svelte-sonner';
	import { tick } from 'svelte';
	import icons from 'currency-icons';
	import { BudgetDialog, ExpenseDialog } from '@/budget-tracker';
	import { getBudgetShareSettings, regenerateBudgetShareLink, setBudgetSharing } from '$lib/remote';
	import { copyToClipboard } from '$lib/utils';
	import { page } from '$app/state';

	// ── Backup state ─────────────────────────────────────────
	let isBackingUp = $state(false);
	let hasUnsavedChanges = $state(false);
	let lastBackedAt = $state<Date | null>(null);

	async function performBackup() {
		if (isBackingUp || !isAuthenticated) return;
		const allBudgets = budgetState.budgets.current;
		if (!allBudgets.length) {
			toast.error('No budgets to back up');
			return;
		}
		isBackingUp = true;
		try {
			const fd = new FormData();
			fd.append('budgets', JSON.stringify(allBudgets));
			const res = await fetch('/apps/budget-tracker?/backupToServer', {
				method: 'POST',
				body: fd
			});
			if (!res.ok) throw new Error(res.statusText);
			hasUnsavedChanges = false;
			lastBackedAt = new Date();
			toast.success('Budget backed up — shared page is now up to date');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Backup failed');
		} finally {
			isBackingUp = false;
		}
	}

	const isAuthenticated = $derived(!!(page.data as { user?: unknown }).user);
	const budgetId = $derived(page.params.id);
	const shareQuery = $derived(getBudgetShareSettings(budgetId));

	// Get the budget by ID
	const budget = $derived(budgetState.budgets.current.find((b) => b.id === budgetId));
	const shareDetails = $derived(shareQuery.current);
	const shareLink = $derived(
		shareDetails?.sharePath && typeof window !== 'undefined'
			? `${window.location.origin}${shareDetails.sharePath}`
			: (shareDetails?.sharePath ?? null)
	);
	let shareVisibilityOverride = $state<boolean | null>(null);
	const shareVisibility = $derived(
		shareVisibilityOverride ?? (shareDetails?.canShare ? shareDetails.isPublic : false)
	);
	let shareFormElement = $state<HTMLFormElement | null>(null);

	// Dialog states
	let editingBudget = $state<{ id: string; name: string; amount: number; currency: string } | null>(
		null
	);
	let editBudgetName = $state('');
	let editBudgetAmount = $state('');
	let editBudgetCurrency = $state('');

	let editingExpense = $state<{ budgetId: string; expense: Expense } | null>(null);
	let editExpenseDescription = $state('');
	let editExpenseAmount = $state('');
	let activeTab = $state('analytics');

	const currencies = [
		'USD',
		'EUR',
		'GBP',
		'JPY',
		'CAD',
		'AUD',
		'CHF',
		'CNY',
		'INR',
		'BRL',
		'NGN'
	].map((code) => ({
		value: code,
		label: `${icons[code]?.name || code} (${icons[code]?.symbol || code})`,
		symbol: icons[code]?.symbol || code,
		icon: icons[code]?.icon || ''
	}));

	// Utility functions
	function formatNumber(value: number): string {
		return value.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
	}

	const pageTitle = $derived(
		budget ? `${budget.name} | Budget Tracker` : 'Budget Not Found | Budget Tracker'
	);
	const pageDescription = $derived(
		budget
			? `Review ${budget.name}, compare spending, and manage expenses in the Budget Tracker.`
			: 'Review budget details, charts, and expenses in the Budget Tracker.'
	);
	const totalSpent = $derived(
		budget ? budget.expenses.reduce((sum, expense) => sum + expense.amount, 0) : 0
	);
	const remaining = $derived(budget ? Math.max(budget.amount - totalSpent, 0) : 0);
	const percentUsed = $derived(
		budget && budget.amount > 0 ? Math.min((totalSpent / budget.amount) * 100, 100) : 0
	);
	const expenseCount = $derived(budget?.expenses.length ?? 0);
	const isOverBudget = $derived(budget ? totalSpent > budget.amount : false);
	const healthLabel = $derived(
		isOverBudget ? 'Over budget' : percentUsed >= 80 ? 'Approaching limit' : 'On track'
	);
	const latestExpenseDate = $derived.by(() => {
		if (!budget || budget.expenses.length === 0) {
			return 'No activity yet';
		}

		const latestExpense = [...budget.expenses].sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)[0];

		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(latestExpense.createdAt));
	});
	const largestExpense = $derived.by(() => {
		if (!budget || budget.expenses.length === 0) {
			return null;
		}

		return [...budget.expenses].sort((a, b) => b.amount - a.amount)[0];
	});

	// Dialog handlers
	function openEditBudgetDialog(b: Budget) {
		editingBudget = { id: b.id, name: b.name, amount: b.amount, currency: b.currency };
		editBudgetName = b.name;
		editBudgetAmount = b.amount.toString();
		editBudgetCurrency = b.currency;
	}

	function updateBudget() {
		if (editingBudget) {
			budgetState.updateBudget(
				editingBudget.id,
				editBudgetName,
				Number(editBudgetAmount),
				editBudgetCurrency
			);
			editingBudget = null;
			toast.success('Budget updated');
			hasUnsavedChanges = true;
		}
	}

	function openEditExpenseDialog(budgetId: string, expense: Expense) {
		editingExpense = { budgetId, expense };
		editExpenseDescription = expense.description;
		editExpenseAmount = expense.amount.toString();
	}

	function updateExpense() {
		if (editingExpense) {
			if (editingExpense.expense.id) {
				budgetState.updateExpense(
					editingExpense.budgetId,
					editingExpense.expense.id,
					editExpenseDescription,
					Number(editExpenseAmount)
				);
				toast.success('Expense updated');
			} else {
				budgetState.addExpense(
					editingExpense.budgetId,
					editExpenseDescription,
					Number(editExpenseAmount)
				);
				toast.success('Expense added');
			}
			editingExpense = null;
			hasUnsavedChanges = true;
		}
	}

	function deleteExpense(budgetId: string, expenseId: string) {
		if (confirm('Are you sure you want to delete this expense?')) {
			budgetState.deleteExpense(budgetId, expenseId);
			toast.success('Expense deleted');
			hasUnsavedChanges = true;
		}
	}

	function handleAddExpense() {
		if (budget) {
			// Create a new empty expense
			editingExpense = {
				budgetId: budget.id,
				expense: {
					id: '',
					description: '',
					amount: 0,
					createdAt: new Date().toISOString()
				}
			};
			editExpenseDescription = '';
			editExpenseAmount = '';
		}
	}

	async function handleShareToggle(checked: boolean) {
		if (!budget || setBudgetSharing.pending) {
			return;
		}

		shareVisibilityOverride = checked;
		await tick();
		shareFormElement?.requestSubmit();
	}

	async function handleCopyShareLink() {
		if (!shareLink) {
			return;
		}

		await copyToClipboard(shareLink, 'Share link copied to clipboard', 'Failed to copy share link');
	}

	function handleOpenSharedPage() {
		if (!shareDetails?.sharePath) {
			return;
		}

		window.open(shareDetails.sharePath, '_blank', 'noopener,noreferrer');
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<Button href="/apps/budget-tracker" variant="ghost" size="sm" class="gap-2 pl-0">
			<ChevronLeft class="h-4 w-4" />
			Back to Budgets
		</Button>

		<!-- Backup status + manual backup button -->
		{#if isAuthenticated}
			<div class="flex items-center gap-2">
				{#if lastBackedAt}
					<span class="text-muted-foreground flex items-center gap-1.5 text-xs">
						<CloudCheck class="h-3.5 w-3.5 text-emerald-500" />
						Backed up {lastBackedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				{/if}
				{#if hasUnsavedChanges}
					<div
						class="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"
					>
						<span class="size-2 animate-pulse rounded-full"></span>
						Unsaved changes
					</div>
				{/if}
				<Button
					size="sm"
					variant={hasUnsavedChanges ? 'default' : 'outline'}
					class="gap-2"
					onclick={performBackup}
					disabled={isBackingUp}
				>
					{#if isBackingUp}
						<Loader2 class="h-3.5 w-3.5 animate-spin" />
						Saving…
					{:else}
						<CloudUpload class="h-3.5 w-3.5" />
						{hasUnsavedChanges ? 'Save to Cloud' : 'Backup'}
					{/if}
				</Button>
			</div>
		{/if}
	</div>

	{#if budget}
		<section class="bg-card rounded-3xl border p-6 shadow-sm sm:p-8">
			<div class="flex flex-col gap-6 lg:flex-row lg:items-start">
				<!-- Left: identity + quick stats -->
				<div class="min-w-0 flex-1 space-y-5">
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
							class={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
								isOverBudget
									? 'border-destructive/30 bg-destructive/5 text-destructive'
									: percentUsed >= 80
										? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
										: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
							}`}
						>
							{healthLabel}
						</span>
					</div>

					<div class="space-y-2">
						<h1 class="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
							{budget.name}
						</h1>
						<p class="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">
							Review the budget at a glance, inspect where the money is going, and manage expenses
							without switching context.
						</p>
					</div>

					<div class="flex flex-col gap-3 sm:flex-row">
						<div class="bg-muted/20 flex-1 rounded-2xl border p-4">
							<div
								class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
							>
								<CircleDollarSign class="h-3.5 w-3.5" />
								Largest entry
							</div>
							<p class="text-foreground mt-2 truncate text-sm font-semibold">
								{largestExpense?.description ?? 'Nothing logged yet'}
							</p>
							<p class="text-muted-foreground mt-1 text-xs">
								{largestExpense ? formatNumber(largestExpense.amount) : '0.00'}
							</p>
						</div>
						<div class="bg-muted/20 flex-1 rounded-2xl border p-4">
							<div
								class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
							>
								<CalendarRange class="h-3.5 w-3.5" />
								Latest activity
							</div>
							<p class="text-foreground mt-2 text-sm font-semibold">{latestExpenseDate}</p>
							<p class="text-muted-foreground mt-1 text-xs">Most recent expense logged</p>
						</div>
						<div class="bg-muted/20 flex-1 rounded-2xl border p-4">
							<div
								class="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase"
							>
								<ChartColumnBig class="h-3.5 w-3.5" />
								Coverage
							</div>
							<p class="text-foreground mt-2 text-sm font-semibold">
								{percentUsed.toFixed(0)}% of this budget is already used
							</p>
							<p class="text-muted-foreground mt-1 text-xs">Useful context for pacing spend</p>
						</div>
					</div>
				</div>

				<!-- Right: health metrics + action buttons -->
				<div class="flex w-full shrink-0 flex-col gap-4 lg:w-72">
					<div class="bg-muted/20 rounded-2xl border p-5">
						<p class="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
							Budget Health
						</p>
						<div class="mt-3 space-y-1">
							<p class="text-foreground text-2xl font-semibold">{formatNumber(remaining)}</p>
							<p class="text-muted-foreground text-sm">
								Remaining before the budget cap is reached
							</p>
						</div>
						<div class="mt-5 space-y-2">
							<div
								class="text-muted-foreground flex items-center justify-between text-xs font-medium"
							>
								<span>Used</span>
								<span>{percentUsed.toFixed(1)}%</span>
							</div>
							<Progress value={percentUsed} class="h-2.5" />
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<Button size="sm" class="gap-2" onclick={handleAddExpense}>
							<Plus class="h-4 w-4" /> Add Expense
						</Button>
						<Button
							variant="outline"
							size="sm"
							class="gap-2"
							onclick={() => openEditBudgetDialog(budget)}
						>
							<Pencil class="h-4 w-4" /> Edit Budget
						</Button>
						{#if isAuthenticated}
							<Button
								variant={hasUnsavedChanges ? 'default' : 'outline'}
								size="sm"
								class="gap-2"
								onclick={performBackup}
								disabled={isBackingUp}
							>
								{#if isBackingUp}
									<Loader2 class="h-3.5 w-3.5 animate-spin" />
									Saving…
								{:else}
									<CloudUpload class="h-3.5 w-3.5" />
									{hasUnsavedChanges ? 'Save to Cloud' : 'Backup'}
								{/if}
							</Button>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<QuickStatsGrid {budget} {formatNumber} />

		<Tabs.Root bind:value={activeTab} activationMode="manual" class="space-y-4">
			<Tabs.List
				class="bg-muted/60 flex h-auto w-full flex-col gap-2 rounded-2xl p-1.5 sm:flex-row"
			>
				<Tabs.Trigger
					value="analytics"
					class="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors data-[state=active]:shadow-sm"
				>
					<ChartColumnBig class="h-4 w-4" />
					Analytics
				</Tabs.Trigger>
				<Tabs.Trigger
					value="expenses"
					class="text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors data-[state=active]:shadow-sm"
				>
					<ReceiptText class="h-4 w-4" />
					Expenses
					{#if expenseCount > 0}
						<span
							class="bg-primary/15 text-foreground rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
						>
							{expenseCount}
						</span>
					{/if}
				</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="analytics" class="space-y-4">
				<section class="bg-card rounded-3xl border p-5 shadow-sm sm:p-6">
					<div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
						<div class="space-y-1">
							<p class="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
								Analytics
							</p>
							<h2 class="text-foreground text-xl font-semibold tracking-tight">
								Spend clarity without the clutter
							</h2>
							<p class="text-muted-foreground max-w-2xl text-sm leading-6">
								Start with the balance view to see how close the budget is to its cap, then read the
								trend chart to spot whether the current pace is accelerating or settling.
							</p>
						</div>
						<div class="flex flex-wrap gap-2 text-xs">
							<span class="text-muted-foreground rounded-full border px-3 py-1 font-medium">
								{expenseCount} logged
							</span>
							<span class="text-muted-foreground rounded-full border px-3 py-1 font-medium">
								{formatNumber(totalSpent)} spent
							</span>
							<span class="text-muted-foreground rounded-full border px-3 py-1 font-medium">
								{formatNumber(remaining)} left
							</span>
						</div>
					</div>

					<div class="mt-5 flex flex-col gap-4 xl:flex-row">
						<div class="min-w-0 flex-1">
							<ComparisonChart {budget} {formatNumber} />
						</div>
						<div class="min-w-0 flex-1">
							<TrendChart expenses={budget.expenses} {formatNumber} />
						</div>
					</div>
				</section>
			</Tabs.Content>

			<Tabs.Content value="expenses">
				<ExpensesSection
					{budget}
					{formatNumber}
					onAddExpense={handleAddExpense}
					onEdit={openEditExpenseDialog}
					onDelete={deleteExpense}
				/>
			</Tabs.Content>
		</Tabs.Root>

		<!-- Sharing -->
		<section class="bg-card rounded-3xl border p-5 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-muted-foreground text-xs font-medium tracking-[0.24em] uppercase">
						Sharing
					</p>
					<h2 class="text-foreground mt-2 text-lg font-semibold">Public link access</h2>
				</div>
				<span
					class={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
						shareDetails?.isPublic
							? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
							: 'text-muted-foreground bg-muted/40 border-border'
					}`}
				>
					{#if shareDetails?.isPublic}
						<Globe class="h-3.5 w-3.5" /> Public
					{:else}
						<Lock class="h-3.5 w-3.5" /> Private
					{/if}
				</span>
			</div>

			{#if !shareDetails}
				<div class="mt-4 rounded-2xl border border-dashed p-4">
					<p class="text-muted-foreground text-sm">Checking sharing status...</p>
				</div>
			{:else if !shareDetails.canShare}
				<div class="mt-4 rounded-2xl border border-dashed p-4">
					<p class="text-foreground text-sm font-medium">
						{shareDetails.reason === 'unauthenticated'
							? 'Sign in to create a shareable budget link.'
							: 'Back up this budget to your account before sharing it.'}
					</p>
					<p class="text-muted-foreground mt-1 text-xs leading-5">
						Sharing only works for budgets that exist on the server, so the public page stays in
						sync.
					</p>
				</div>
			{:else}
				<div class="mt-4 space-y-4">
					<form
						bind:this={shareFormElement}
						{...setBudgetSharing.enhance(async ({ submit }) => {
							const nextState = shareVisibility;
							try {
								await submit();
								await shareQuery.refresh();
								shareVisibilityOverride = null;
								toast.success(nextState ? 'Budget sharing enabled' : 'Budget sharing turned off');
							} catch (error) {
								console.error('Error updating budget sharing:', error);
								shareVisibilityOverride = null;
								toast.error(
									error instanceof Error ? error.message : 'Unable to update sharing settings'
								);
							}
						})}
						class="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<input type="hidden" name="budgetId" value={budget.id} />
						<input type="hidden" name="isPublic" value={String(shareVisibility)} />
						<div class="space-y-1">
							<p class="text-foreground text-sm font-medium">Anyone with the link can view</p>
							<p class="text-muted-foreground max-w-lg text-xs leading-5">
								The public page is view-only and does not expose editing actions.
							</p>
						</div>
						<div class="flex shrink-0 items-center gap-3">
							<Switch
								checked={shareVisibility}
								disabled={!!setBudgetSharing.pending}
								onCheckedChange={handleShareToggle}
								id="budget-share-switch"
							/>
							<Button
								type="submit"
								variant="outline"
								size="sm"
								disabled={!!setBudgetSharing.pending}
							>
								{#if setBudgetSharing.pending}
									Updating...
								{:else}
									Update Access
								{/if}
							</Button>
						</div>
					</form>

					<div class="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-start">
						<div class="flex min-w-0 flex-1 items-start gap-3">
							<div class="bg-muted shrink-0 rounded-xl p-2">
								<Eye class="text-foreground h-4 w-4" />
							</div>
							<div class="min-w-0">
								<p class="text-foreground text-sm font-medium">Shared page link</p>
								<p class="text-muted-foreground mt-1 text-xs leading-5 break-all">
									{shareLink ?? 'Enable public access to generate a live share link.'}
								</p>
							</div>
						</div>
						<div class="flex shrink-0 flex-row flex-wrap gap-2">
							<Button
								variant="outline"
								size="sm"
								class="gap-2"
								disabled={!shareLink}
								onclick={handleCopyShareLink}
							>
								<Copy class="h-4 w-4" /> Copy Link
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="gap-2"
								disabled={!shareLink}
								onclick={handleOpenSharedPage}
							>
								<Eye class="h-4 w-4" /> Open Shared Page
							</Button>
							<form
								{...regenerateBudgetShareLink.enhance(async ({ submit }) => {
									try {
										await submit();
										await shareQuery.refresh();
										toast.success('Share link regenerated');
									} catch (error) {
										console.error('Error regenerating share link:', error);
										toast.error(
											error instanceof Error ? error.message : 'Unable to regenerate share link'
										);
									}
								})}
							>
								<input type="hidden" name="budgetId" value={budget.id} />
								<Button
									type="submit"
									variant="outline"
									size="sm"
									class="gap-2"
									disabled={!!regenerateBudgetShareLink.pending}
								>
									<RefreshCcw class="h-4 w-4" />
									{#if regenerateBudgetShareLink.pending}
										Working...
									{:else}
										{shareDetails.hasShareToken ? 'Regenerate Link' : 'Generate Link'}
									{/if}
								</Button>
							</form>
						</div>
					</div>
				</div>
			{/if}
		</section>
	{:else}
		<section class="bg-card rounded-3xl border p-8 shadow-sm">
			<h1 class="text-foreground text-2xl font-semibold">Budget Not Found</h1>
			<p class="text-muted-foreground mt-2 text-sm">The budget you're looking for doesn't exist.</p>
		</section>
	{/if}

	<!-- Dialogs -->
	<BudgetDialog
		bind:editingBudget
		bind:editBudgetName
		bind:editBudgetAmount
		bind:editBudgetCurrency
		{updateBudget}
		{formatNumber}
		{currencies}
	/>

	<ExpenseDialog
		bind:editingExpense
		bind:editExpenseDescription
		bind:editExpenseAmount
		{updateExpense}
		{deleteExpense}
		{formatNumber}
	/>
</div>
