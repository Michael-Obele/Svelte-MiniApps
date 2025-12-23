<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { goto } from '$app/navigation';

	let { computed, year, username } = $props<{
		computed: any;
		year: string;
		username: string;
	}>();
</script>

<div class="space-y-4">
	<!-- Contribution Types with Progress Bars -->
	<Card>
		<CardHeader>
			<CardTitle>Contribution Breakdown</CardTitle>
			<CardDescription>Distribution of your contributions by type</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#each computed.contributionTypes as type (type.label)}
				{@const Icon = type.icon}
				{@const percentage =
					computed.totalContributions > 0 ? (type.value / computed.totalContributions) * 100 : 0}
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
							style="width: {Math.min((parseFloat(computed.insights.avgPerDay) / 10) * 100, 100)}%"
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
					{#each computed.contributionYears ?? [] as availableYear (availableYear)}
						<Button
							variant={availableYear.toString() === year ? 'default' : 'outline'}
							onclick={() => goto(`/apps/github-contribution-tracker/${username}/${availableYear}`)}
						>
							{availableYear}
						</Button>
					{/each}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
