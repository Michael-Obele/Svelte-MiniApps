<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		ArrowLeft,
		RotateCw,
		TrendingUp,
		GitBranch,
		GitCommit,
		GitPullRequest,
		MessageSquare
	} from '@lucide/svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { Button } from '@/ui/button';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import * as Tabs from '@/ui/tabs';
	import { Chart, Bars, Calendar, Axis, Svg, Tooltip, Highlight } from 'layerchart';
	import { scaleBand, scaleThreshold } from 'd3-scale';
	import { format as formatDate, parseISO } from 'date-fns';
	import { PeriodType, format } from 'svelte-ux';
	import { flatGroup } from 'd3-array';
	import { toast } from 'svelte-sonner';
	import { getContributionData } from '$lib/remote/data.remote';
	import type { ContributionData } from '$lib/remote/data.remote';

	// Get params from URL
	const username = $derived($page.params.user);
	const year = $derived($page.params.year);

	// Fetch data using remote function
	const contributionQuery = $derived(getContributionData({ username, year }));

	// Derived stats and computations
	const totalContributions = $derived(contributionQuery.current?.totalContributions ?? 0);
	const stats = $derived(contributionQuery.current?.stats);

	// Process calendar data for visualization
	const calendarData = $derived(
		contributionQuery.current?.contributions.map((d: any) => ({
			date: parseISO(d.date),
			value: d.contributionCount,
			color: d.color
		})) ?? []
	);

	const calendarDataByYear = $derived(flatGroup(calendarData, (d: any) => d.date.getFullYear()));

	// Monthly aggregation for bar chart
	const monthlyData = $derived.by(() => {
		if (!contributionQuery.current?.contributions) return [];

		const months: Record<number, number> = {};

		contributionQuery.current.contributions.forEach((contribution: any) => {
			const date = new Date(contribution.date);
			const month = date.getMonth();
			months[month] = (months[month] || 0) + contribution.contributionCount;
		});

		return Array.from({ length: 12 }, (_, i) => ({
			date: new Date(parseInt(year), i, 1),
			contributionCount: months[i] || 0
		}));
	});

	// Repository insights
	const topRepositories = $derived(contributionQuery.current?.repositories.slice(0, 10) ?? []);

	const languageBreakdown = $derived.by(() => {
		if (!contributionQuery.current?.repositories) return [];

		const languages: Record<string, number> = {};

		contributionQuery.current.repositories.forEach((repo: any) => {
			if (repo.primaryLanguage) {
				const lang = repo.primaryLanguage.name;
				languages[lang] = (languages[lang] || 0) + 1;
			}
		});

		return Object.entries(languages)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 8);
	});

	// Contribution type breakdown
	const contributionTypes = $derived([
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
	]);

	// Insights
	const insights = $derived.by(() => {
		if (!stats)
			return { avgPerDay: '0', mostActiveType: '', repoCount: 0, hasPrivateContributions: false };

		const avgPerDay = (totalContributions / 365).toFixed(1);
		const mostActiveType = contributionTypes.reduce((max, type) =>
			type.value > max.value ? type : max
		);
		const repoCount = stats.totalRepositoryContributions;

		return {
			avgPerDay,
			mostActiveType: mostActiveType.label,
			repoCount,
			hasPrivateContributions: stats.restrictedContributionsCount > 0
		};
	});

	async function refreshData() {
		toast.promise(contributionQuery.refresh(), {
			loading: 'Refreshing data...',
			success: 'Data refreshed successfully!',
			error: 'Failed to refresh data'
		});
	}

	async function navigateBack() {
		await goto('/apps/github-contribution-tracker');
	}
</script>

<RouteHead
	title="{username} - GitHub Contributions in {year}"
	description="Visualize {username}'s GitHub contributions for {year} with interactive charts, heatmaps, and detailed insights."
	keywords="github contributions, contribution tracking, activity heatmap, developer stats"
	route="/apps/github-contribution-tracker/{username}/{year}"
/>

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
			<Button variant="outline" size="icon" onclick={refreshData}>
				<RotateCw class="h-4 w-4" />
			</Button>
			<Button variant="outline" onclick={navigateBack}>
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back
			</Button>
		</div>
	</div>

	<!-- Key Stats -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-muted-foreground text-sm font-medium">Total Contributions</p>
						<p class="text-3xl font-bold">{totalContributions.toLocaleString()}</p>
					</div>
					<TrendingUp class="text-primary h-8 w-8" />
				</div>
			</CardContent>
		</Card>

		{#each contributionTypes as type}
			{@const Icon = type.icon}
			<Card>
				<CardContent class="p-6">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-muted-foreground text-sm font-medium">{type.label}</p>
							<p class="text-3xl font-bold">{type.value.toLocaleString()}</p>
						</div>
						<Icon class="h-8 w-8 {type.color}" />
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	<!-- Streak Stats -->
	{#if contributionQuery.current?.streakStats.light || contributionQuery.current?.streakStats.dark}
		<Card>
			<CardContent class="p-4">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{#if contributionQuery.current?.streakStats.light}
					<div class="dark:hidden">
						{@html contributionQuery.current.streakStats.light}
					</div>
				{/if}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{#if contributionQuery.current?.streakStats.dark}
					<div class="hidden dark:block">
						{@html contributionQuery.current.streakStats.dark}
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
				<CardContent>
					<div class="h-[400px] w-full">
						<Chart
							data={monthlyData}
							x="date"
							xScale={scaleBand().padding(0.4)}
							y="contributionCount"
							yDomain={[0, null]}
							yNice={4}
							padding={{ left: 40, bottom: 40, top: 20, right: 20 }}
							tooltip={{ mode: 'band' }}
						>
							<Svg>
								<Axis placement="left" grid rule />
								<Axis placement="bottom" format={(d) => formatDate(d, 'MMM')} rule />
								<Bars radius={4} strokeWidth={1} class="fill-green-700 dark:fill-green-500" />
								<Highlight area />
							</Svg>

							<Tooltip.Root offset={8} placement="top" let:data>
								<Tooltip.Header>{formatDate(data.date, 'MMMM yyyy')}</Tooltip.Header>
								<Tooltip.List>
									<Tooltip.Item label="Contributions" value={data.contributionCount} />
								</Tooltip.List>
							</Tooltip.Root>
						</Chart>
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
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{#each languageBreakdown as lang}
							<div class="flex items-center justify-between rounded-lg border p-3">
								<span class="font-medium">{lang.name}</span>
								<span class="text-muted-foreground text-sm">{lang.count} repos</span>
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
						{#each topRepositories as repo}
							<a
								href={repo.url}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:bg-accent block rounded-lg border p-4 transition-colors"
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
					<CardTitle>Contribution Heatmap</CardTitle>
					<CardDescription>Daily contribution activity throughout {year}</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="h-[300px] w-full">
						<Chart
							data={calendarData}
							x="date"
							c="value"
							cScale={scaleThreshold().unknown('transparent')}
							cDomain={[1, 3, 6, 10]}
							cRange={['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']}
							let:tooltip
						>
							<Svg>
								{#each calendarDataByYear as [calYear, yearData]}
									<Calendar
										start={(yearData as any)[0].date}
										end={(yearData as any)[(yearData as any).length - 1].date}
										{tooltip}
										monthPath
									/>
								{/each}
							</Svg>

							<Tooltip.Root offset={16} placement="top" let:data>
								<Tooltip.Header>{format(data.date, PeriodType.Day)}</Tooltip.Header>
								{#if data?.value != null}
									<Tooltip.List>
										<Tooltip.Item label="Contributions" value={data.value} format="integer" />
									</Tooltip.List>
								{/if}
							</Tooltip.Root>
						</Chart>
					</div>
				</CardContent>
			</Card>
		</Tabs.Content>

		<!-- Insights Tab -->
		<Tabs.Content value="insights" class="mt-6 space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Activity Summary</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Average per day:</span>
							<span class="font-bold">{insights.avgPerDay}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Most active in:</span>
							<span class="font-bold">{insights.mostActiveType}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Repositories:</span>
							<span class="font-bold">{insights.repoCount}</span>
						</div>
						{#if insights.hasPrivateContributions}
							<div class="border-t pt-3">
								<p class="text-muted-foreground text-sm">
									This user also has {stats?.restrictedContributionsCount ?? 0} private contributions
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
						<div class="flex justify-between">
							<span class="text-muted-foreground">With commits:</span>
							<span class="font-bold">{stats?.totalRepositoriesWithContributedCommits ?? 0}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">With PRs:</span>
							<span class="font-bold"
								>{stats?.totalRepositoriesWithContributedPullRequests ?? 0}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">With issues:</span>
							<span class="font-bold">{stats?.totalRepositoriesWithContributedIssues ?? 0}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">With reviews:</span>
							<span class="font-bold"
								>{stats?.totalRepositoriesWithContributedPullRequestReviews ?? 0}</span
							>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Available Years -->
			{#if (contributionQuery.current?.contributionYears?.length ?? 0) > 1}
				<Card>
					<CardHeader>
						<CardTitle>Available Years</CardTitle>
						<CardDescription>Other years with contribution data</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="flex flex-wrap gap-2">
							{#each contributionQuery.current?.contributionYears ?? [] as availableYear}
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
