<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		ArrowLeft,
		TrendingUp,
		GitBranch,
		GitCommit,
		GitPullRequest,
		MessageSquare,
		TriangleAlert
	} from '@lucide/svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import * as Tabs from '@/ui/tabs';
	import * as Chart from '@/ui/chart';
	import { format as formatDate, parseISO } from 'date-fns';
	import type { ContributionData } from './+page.server';

	// Tab Components
	import OverviewTab from './components/OverviewTab.svelte';
	import RepositoriesTab from './components/RepositoriesTab.svelte';
	import CalendarTab from './components/CalendarTab.svelte';
	import InsightsTab from './components/InsightsTab.svelte';

	// Get data from load function - available before component renders
	let { data } = $props();

	// Get params from URL for display
	const username = page.params.user;
	const year = page.params.year;

	// Computed stats derived from load function data
	const computed = $derived.by(() => computeStats(data.contributionData));

	function computeStats(data: ContributionData) {
		const totalContributions = data?.totalContributions ?? 0;
		const stats = data?.stats;

		// Process calendar data for heatmap visualization
		const calendarData =
			data?.contributions.map((d: any) => ({
				date: parseISO(d.date),
				value: d.contributionCount,
				color: d.color
			})) ?? [];

		// Monthly aggregation for bar chart
		const months: Record<number, number> = {};
		data?.contributions.forEach((contribution: any) => {
			const date = new Date(contribution.date);
			const month = date.getMonth();
			months[month] = (months[month] || 0) + contribution.contributionCount;
		});

		const monthlyData = Array.from({ length: 12 }, (_, i) => ({
			month: new Date(parseInt(year), i, 1).toLocaleDateString('en-US', { month: 'short' }),
			date: new Date(parseInt(year), i, 1),
			contributions: months[i] || 0
		}));

		// Repository insights
		const topRepositories = data?.repositories.slice(0, 10) ?? [];

		const languages: Record<string, number> = {};
		data?.repositories.forEach((repo: any) => {
			if (repo.primaryLanguage) {
				const lang = repo.primaryLanguage.name;
				languages[lang] = (languages[lang] || 0) + 1;
			}
		});

		const languageBreakdown = Object.entries(languages)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 8);

		// Contribution type breakdown
		const contributionTypes = [
			{
				label: 'Commits',
				value: stats?.totalCommitContributions ?? 0,
				icon: GitCommit,
				color: 'text-green-500'
			},
			{
				label: 'Pull Requests',
				value: stats?.totalPullRequestContributions ?? 0,
				icon: GitPullRequest,
				color: 'text-blue-500'
			},
			{
				label: 'Issues',
				value: stats?.totalIssueContributions ?? 0,
				icon: MessageSquare,
				color: 'text-yellow-500'
			},
			{
				label: 'Reviews',
				value: stats?.totalPullRequestReviewContributions ?? 0,
				icon: GitBranch,
				color: 'text-purple-500'
			}
		];

		// Insights
		const avgPerDay = (totalContributions / 365).toFixed(1);
		const mostActiveType = contributionTypes.reduce((max, type) =>
			type.value > max.value ? type : max
		);
		const repoCount = stats?.totalRepositoryContributions ?? 0;

		const insights = {
			avgPerDay,
			mostActiveType: mostActiveType.label,
			repoCount,
			hasPrivateContributions: (stats?.restrictedContributionsCount ?? 0) > 0
		};

		return {
			totalContributions,
			stats,
			calendarData,
			monthlyData,
			topRepositories,
			languageBreakdown,
			contributionTypes,
			insights,
			contributionYears: data?.contributionYears ?? [],
			streakStats: data?.streakStats
		};
	}

	// Chart configuration
	const chartConfig = {
		contributions: {
			label: 'Contributions',
			color: 'hsl(var(--chart-1))'
		}
	} satisfies Chart.ChartConfig;

	async function navigateBack() {
		await goto('/apps/github-contribution-tracker');
	}

	function refreshData() {
		window.location.reload();
	}
</script>

<RouteHead
	title="{username} - GitHub Contributions in {year}"
	description="Visualize {username}'s GitHub contributions for {year} with interactive charts, heatmaps, and detailed insights."
	keywords="github contributions, contribution tracking, activity heatmap, developer stats"
	route="/apps/github-contribution-tracker/{username}/{year}"
/>

<!-- Development Banner -->
<div class="mx-auto my-4 max-w-6xl px-4">
	<div
		class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<TriangleAlert class="h-5 w-5" />
				<span class="font-medium">Development Mode</span>
			</div>
			<p class="text-sm">
				This app is currently under development and may have bugs or incomplete features.
			</p>
		</div>
	</div>
</div>

<!-- Header -->
<div class="mx-auto my-8 max-w-6xl space-y-6 px-4">
	<div class="flex items-center justify-between">
		<div class="space-y-2">
			<h1
				class="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-white/70"
			>
				{username}
			</h1>
			<p class="text-muted-foreground text-lg">
				GitHub Contributions in {year}
			</p>
		</div>

		<div class="flex gap-2">
			<Button variant="outline" onclick={navigateBack}>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back
			</Button>
		</div>
	</div>

	<!-- Key Stats -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card class="transition-all duration-200 hover:shadow-lg">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<p class="text-muted-foreground text-sm font-medium">Total Contributions</p>
						<p class="text-3xl font-bold tabular-nums">
							{computed.totalContributions.toLocaleString()}
						</p>
					</div>
					<div class="bg-primary/10 rounded-full p-3">
						<TrendingUp class="text-primary h-5 w-5" />
					</div>
				</div>
			</CardContent>
		</Card>

		{#each computed.contributionTypes as type (type.label)}
			{@const Icon = type.icon}
			<Card class="transition-all duration-200 hover:shadow-lg">
				<CardContent class="p-6">
					<div class="flex items-center justify-between">
						<div class="space-y-1">
							<p class="text-muted-foreground text-sm font-medium">{type.label}</p>
							<p class="text-3xl font-bold tabular-nums">{type.value.toLocaleString()}</p>
						</div>
						<div class="rounded-full p-3" style="background-color: {type.color}15">
							<Icon class="h-5 w-5 {type.color}" />
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Streak Stats -->
	{#if computed.streakStats?.light || computed.streakStats?.dark}
		<Card>
			<CardContent class="p-4">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{#if computed.streakStats.light}
					<div class="dark:hidden">
						{@html computed.streakStats.light}
					</div>
				{/if}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{#if computed.streakStats.dark}
					<div class="hidden dark:block">
						{@html computed.streakStats.dark}
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Main Content -->
<div class="mx-auto max-w-6xl px-4">
	<Tabs.Root value="overview" class="w-full">
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="repositories">Repositories</Tabs.Trigger>
			<Tabs.Trigger value="calendar">Calendar</Tabs.Trigger>
			<Tabs.Trigger value="insights">Insights</Tabs.Trigger>
		</Tabs.List>

		<!-- Overview Tab -->
		<Tabs.Content value="overview" class="mt-6">
			<OverviewTab {computed} {chartConfig} {year} />
		</Tabs.Content>

		<!-- Repositories Tab -->
		<Tabs.Content value="repositories" class="mt-6">
			<RepositoriesTab {computed} {year} />
		</Tabs.Content>

		<!-- Calendar Tab -->
		<Tabs.Content value="calendar" class="mt-6">
			<CalendarTab {computed} {year} />
		</Tabs.Content>

		<!-- Insights Tab -->
		<Tabs.Content value="insights" class="mt-6">
			<InsightsTab {computed} {year} {username} />
		</Tabs.Content>
	</Tabs.Root>
</div>

<div class="my-12"></div>

```
