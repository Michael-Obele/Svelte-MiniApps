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
	import { BarChart, AreaChart } from 'layerchart';
	import * as Chart from '@/ui/chart';
	import { scaleBand } from 'd3-scale';
	import { format as formatDate, parseISO } from 'date-fns';
	import { cubicInOut } from 'svelte/easing';
	import type { ContributionData } from './+page.server';

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

		{#each computed.contributionTypes as type}
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
		<Tabs.Content value="overview" class="mt-6 space-y-6">
			<!-- Monthly Contributions Chart -->
			<Card>
				<CardHeader>
					<CardTitle>Monthly Contributions</CardTitle>
					<CardDescription>Total contributions per month in {year}</CardDescription>
				</CardHeader>
				<CardContent class="px-2 pt-4 sm:px-6 sm:pt-6">
					<div class="w-full overflow-x-auto">
						<Chart.Container config={chartConfig} class="h-[300px] min-w-[300px] sm:h-[400px]">
							<BarChart
								data={computed.monthlyData}
								xScale={scaleBand().padding(0.4)}
								x="month"
								axis="x"
								series={[
									{
										key: 'contributions',
										label: 'Contributions',
										color: chartConfig.contributions.color
									}
								]}
								props={{
									bars: {
										stroke: 'none',
										rounded: 'all',
										radius: 8,
										motion: {
											x: { type: 'tween', duration: 500, easing: cubicInOut },
											width: { type: 'tween', duration: 500, easing: cubicInOut },
											height: { type: 'tween', duration: 500, easing: cubicInOut },
											y: { type: 'tween', duration: 500, easing: cubicInOut }
										}
									},
									highlight: { area: { fill: 'none' } }
								}}
							>
								{#snippet tooltip()}
									<Chart.Tooltip
										labelFormatter={(month: string) => {
											const monthData = computed.monthlyData.find((d) => d.month === month);
											return monthData ? formatDate(monthData.date, 'MMMM yyyy') : month;
										}}
										hideLabel={false}
									/>
								{/snippet}
							</BarChart>
						</Chart.Container>
					</div>
				</CardContent>
			</Card>

			<!-- Language Breakdown -->
			<Card>
				<CardHeader>
					<CardTitle>Languages Used</CardTitle>
					<CardDescription>Top programming languages in contributed repositories</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each computed.languageBreakdown as lang, i}
							{@const totalRepos = computed.languageBreakdown.reduce((sum, l) => sum + l.count, 0)}
							{@const percentage = ((lang.count / totalRepos) * 100).toFixed(1)}
							{@const colors = [
								'bg-blue-500',
								'bg-purple-500',
								'bg-green-500',
								'bg-yellow-500',
								'bg-red-500',
								'bg-pink-500',
								'bg-indigo-500',
								'bg-teal-500'
							]}
							<div class="space-y-1">
								<div class="flex items-center justify-between text-sm">
									<span class="font-medium">{lang.name}</span>
									<span class="text-muted-foreground">
										{lang.count}
										{lang.count === 1 ? 'repo' : 'repos'} ({percentage}%)
									</span>
								</div>
								<div class="bg-secondary h-2 w-full overflow-hidden rounded-full">
									<div
										class="{colors[i % colors.length]} h-full transition-all duration-300"
										style="width: {percentage}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</Tabs.Content>

		<!-- Repositories Tab -->
		<Tabs.Content value="repositories" class="mt-6 space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Top Contributed Repositories</CardTitle>
					<CardDescription>Most starred repositories you contributed to in {year}</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each computed.topRepositories as repo}
							<a
								href={repo.url}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-accent block rounded-lg border p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
							>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<h3 class="font-semibold">{repo.nameWithOwner}</h3>
										{#if repo.description}
											<p class="text-muted-foreground mt-1 text-sm">{repo.description}</p>
										{/if}
										<div class="mt-2 flex items-center gap-4 text-sm">
											{#if repo.primaryLanguage}
												<span class="flex items-center gap-1">
													<span
														class="h-3 w-3 rounded-full"
														style="background-color: {repo.primaryLanguage.color}"
													></span>
													{repo.primaryLanguage.name}
												</span>
											{/if}
											<span>⭐ {repo.stargazerCount.toLocaleString()}</span>
											<span>🍴 {repo.forkCount.toLocaleString()}</span>
										</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
				</CardContent>
			</Card>
		</Tabs.Content>

		<!-- Calendar Tab -->
		<Tabs.Content value="calendar" class="mt-6">
			<Card>
				<CardHeader>
					<CardTitle>Contribution Calendar</CardTitle>
					<CardDescription>Daily contribution activity throughout {year}</CardDescription>
				</CardHeader>
				<CardContent class="px-2 sm:px-6">
					<!-- GitHub-style contribution grid -->
					<div class="w-full overflow-x-auto">
						<div class="inline-block min-w-full">
							<!-- Legend -->
							<div class="text-muted-foreground mb-4 flex items-center justify-between text-xs">
								<span>Less</span>
								<div class="flex gap-1">
									<div class="bg-muted h-3 w-3 rounded-sm"></div>
									<div class="h-3 w-3 rounded-sm bg-green-100 dark:bg-green-950"></div>
									<div class="h-3 w-3 rounded-sm bg-green-300 dark:bg-green-800"></div>
									<div class="h-3 w-3 rounded-sm bg-green-500 dark:bg-green-600"></div>
									<div class="h-3 w-3 rounded-sm bg-green-700 dark:bg-green-400"></div>
								</div>
								<span>More</span>
							</div>

							<!-- Contribution grid -->
							<div class="flex gap-1">
								<!-- Month labels (left side) -->
								<div class="text-muted-foreground flex flex-col justify-around text-xs">
									<span>Mon</span>
									<span>Wed</span>
									<span>Fri</span>
								</div>

								<!-- Days grid -->
								<div class="flex-1">
									<div class="grid grid-flow-col grid-rows-7 gap-1">
										{#each computed.calendarData as day}
											{@const level =
												day.value === 0
													? 0
													: day.value <= 3
														? 1
														: day.value <= 6
															? 2
															: day.value <= 10
																? 3
																: 4}
											{@const bgColor =
												level === 0
													? 'bg-muted'
													: level === 1
														? 'bg-green-100 dark:bg-green-950'
														: level === 2
															? 'bg-green-300 dark:bg-green-800'
															: level === 3
																? 'bg-green-500 dark:bg-green-600'
																: 'bg-green-700 dark:bg-green-400'}
											<div
												class="group relative h-3 w-3 cursor-pointer rounded-sm {bgColor} hover:ring-primary transition-all duration-200 hover:scale-125 hover:ring-2"
												title="{day.value} contributions on {formatDate(day.date, 'MMM d, yyyy')}"
											>
												<!-- Enhanced tooltip on hover -->
												<div
													class="bg-popover pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded-lg border px-3 py-2 text-xs whitespace-nowrap shadow-lg group-hover:block"
												>
													<div class="font-semibold">{day.value} contributions</div>
													<div class="text-muted-foreground">
														{formatDate(day.date, 'EEEE, MMMM d, yyyy')}
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</Tabs.Content>

		<!-- Insights Tab -->
		<Tabs.Content value="insights" class="mt-6 space-y-4">
			<!-- Contribution Types with Progress Bars -->
			<Card>
				<CardHeader>
					<CardTitle>Contribution Breakdown</CardTitle>
					<CardDescription>Distribution of your contributions by type</CardDescription>
				</CardHeader>
				<CardContent class="space-y-4">
					{#each computed.contributionTypes as type}
						{@const Icon = type.icon}
						{@const percentage =
							computed.totalContributions > 0
								? (type.value / computed.totalContributions) * 100
								: 0}
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<Icon class="h-4 w-4 {type.color}" />
									<span class="text-sm font-medium">{type.label}</span>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-muted-foreground text-sm">{percentage.toFixed(1)}%</span>
									<span class="text-sm font-bold">{type.value.toLocaleString()}</span>
								</div>
							</div>
							<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
								<div
									class="h-full rounded-full {type.color === 'text-green-500'
										? 'bg-green-500'
										: type.color === 'text-blue-500'
											? 'bg-blue-500'
											: type.color === 'text-yellow-500'
												? 'bg-yellow-500'
												: 'bg-purple-500'} transition-all duration-500"
									style="width: {percentage}%"
								></div>
							</div>
						</div>
					{/each}
				</CardContent>
			</Card>

			<div class="grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Activity Summary</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground text-sm">Average per day</span>
								<span class="text-2xl font-bold">{computed.insights.avgPerDay}</span>
							</div>
							<div class="bg-muted h-1 w-full overflow-hidden rounded-full">
								<div
									class="bg-primary h-full rounded-full transition-all duration-500"
									style="width: {Math.min(
										(parseFloat(computed.insights.avgPerDay) / 10) * 100,
										100
									)}%"
								></div>
							</div>
						</div>

						<div class="flex items-center justify-between border-t pt-3">
							<span class="text-muted-foreground text-sm">Most active in</span>
							<span class="font-semibold">{computed.insights.mostActiveType}</span>
						</div>

						<div class="flex items-center justify-between border-t pt-3">
							<span class="text-muted-foreground text-sm">Repositories</span>
							<span class="text-2xl font-bold">{computed.insights.repoCount}</span>
						</div>

						{#if computed.insights.hasPrivateContributions}
							<div class="border-t pt-3">
								<p class="text-muted-foreground text-sm">
									+ {computed.stats?.restrictedContributionsCount ?? 0} private contributions
								</p>
							</div>
						{/if}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Repository Breakdown</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground text-sm">With commits</span>
								<span class="font-bold"
									>{computed.stats?.totalRepositoriesWithContributedCommits ?? 0}</span
								>
							</div>
							<div class="bg-muted h-1 w-full overflow-hidden rounded-full">
								<div
									class="h-full rounded-full bg-green-500 transition-all duration-500"
									style="width: {computed.insights.repoCount > 0
										? ((computed.stats?.totalRepositoriesWithContributedCommits ?? 0) /
												computed.insights.repoCount) *
											100
										: 0}%"
								></div>
							</div>
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground text-sm">With PRs</span>
								<span class="font-bold"
									>{computed.stats?.totalRepositoriesWithContributedPullRequests ?? 0}</span
								>
							</div>
							<div class="bg-muted h-1 w-full overflow-hidden rounded-full">
								<div
									class="h-full rounded-full bg-blue-500 transition-all duration-500"
									style="width: {computed.insights.repoCount > 0
										? ((computed.stats?.totalRepositoriesWithContributedPullRequests ?? 0) /
												computed.insights.repoCount) *
											100
										: 0}%"
								></div>
							</div>
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground text-sm">With issues</span>
								<span class="font-bold"
									>{computed.stats?.totalRepositoriesWithContributedIssues ?? 0}</span
								>
							</div>
							<div class="bg-muted h-1 w-full overflow-hidden rounded-full">
								<div
									class="h-full rounded-full bg-yellow-500 transition-all duration-500"
									style="width: {computed.insights.repoCount > 0
										? ((computed.stats?.totalRepositoriesWithContributedIssues ?? 0) /
												computed.insights.repoCount) *
											100
										: 0}%"
								></div>
							</div>
						</div>

						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground text-sm">With reviews</span>
								<span class="font-bold"
									>{computed.stats?.totalRepositoriesWithContributedPullRequestReviews ?? 0}</span
								>
							</div>
							<div class="bg-muted h-1 w-full overflow-hidden rounded-full">
								<div
									class="h-full rounded-full bg-purple-500 transition-all duration-500"
									style="width: {computed.insights.repoCount > 0
										? ((computed.stats?.totalRepositoriesWithContributedPullRequestReviews ?? 0) /
												computed.insights.repoCount) *
											100
										: 0}%"
								></div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Available Years -->
			{#if (computed.contributionYears?.length ?? 0) > 1}
				<Card>
					<CardHeader>
						<CardTitle>Available Years</CardTitle>
						<CardDescription>Other years with contribution data</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="flex flex-wrap gap-2">
							{#each computed.contributionYears ?? [] as availableYear}
								<Button
									variant={availableYear.toString() === year ? 'default' : 'outline'}
									onclick={() =>
										goto(`/apps/github-contribution-tracker/${username}/${availableYear}`)}
								>
									{availableYear}
								</Button>
							{/each}
						</div>
					</CardContent>
				</Card>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</div>

<div class="my-12"></div>

```
