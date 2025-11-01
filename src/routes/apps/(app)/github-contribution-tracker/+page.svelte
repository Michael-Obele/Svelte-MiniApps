<script lang="ts">
	import { Input } from '@/ui/input/index.js';
	import { Button } from '@/ui/button/index.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
	import { HelpCircle, Clock, TrendingUp, TriangleAlert } from '@lucide/svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { githubContributionTrackerHowToUse } from './how-to-use-config';
	import { PersistedState } from 'runed';

	// State
	let username = $state('');
	let year = $state(new Date().getFullYear().toString());
	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState(
		'github-contribution-tracker-has-seen-how-to-use',
		false
	);

	// Recent searches stored in localStorage
	interface RecentSearch {
		username: string;
		year: string;
		timestamp: number;
	}

	let recentSearches = new PersistedState<RecentSearch[]>('github-contribution-tracker-recent', []);

	// Suggested years
	const currentYear = new Date().getFullYear();
	const suggestedYears = $derived([currentYear, currentYear - 1, currentYear - 2]);

	// Dynamic href based on inputs
	const trackerUrl = $derived(
		username.trim() && year ? `/apps/github-contribution-tracker/${username.trim()}/${year}` : null
	);

	// Check if form is valid
	const isValid = $derived(!!username.trim() && !!year);

	function loadRecentSearch(search: RecentSearch) {
		username = search.username;
		year = search.year;
	}

	// Add to recent searches when clicking the track button
	function addToRecentSearches() {
		if (!username.trim()) return;

		const newSearch: RecentSearch = {
			username: username.trim(),
			year,
			timestamp: Date.now()
		};

		// Keep only last 5 searches, remove duplicates
		const filtered = recentSearches.current.filter(
			(s) => !(s.username === newSearch.username && s.year === newSearch.year)
		);
		recentSearches.current = [newSearch, ...filtered].slice(0, 5);
	}
</script>

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

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="mb-12 text-center">
		<div class="mb-4 flex items-center justify-center gap-4">
			<h1
				class="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-white/70"
			>
				GitHub Contribution Tracker
			</h1>
			<Button variant="outline" size="icon" onclick={() => (showHowToUse = true)} class="shrink-0">
				<HelpCircle class="h-4 w-4" />
			</Button>
		</div>
		<p class="text-muted-foreground mx-auto max-w-2xl">
			Visualize and analyze GitHub contributions with detailed statistics, heatmaps, and insights
		</p>
	</div>

	<div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
		<!-- Main Form -->
		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle>Track Contributions</CardTitle>
				<CardDescription>Enter a GitHub username and year to view their activity</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-6">
					<div class="space-y-2">
						<label for="username" class="text-sm font-medium">GitHub Username</label>
						<Input
							id="username"
							name="username"
							bind:value={username}
							placeholder="e.g., torvalds, gaearon"
							autocomplete="username"
						/>
					</div>

					<div class="space-y-2">
						<label for="year" class="text-sm font-medium">Year</label>
						<Input
							id="year"
							name="year"
							type="number"
							bind:value={year}
							min="2008"
							max={currentYear}
						/>
						<div class="flex flex-wrap gap-2">
							{#each suggestedYears as suggestedYear (suggestedYear)}
								<Button
									variant="outline"
									size="sm"
									onclick={() => (year = suggestedYear.toString())}
									class="text-xs"
								>
									{suggestedYear}
								</Button>
							{/each}
						</div>
					</div>

					{#if trackerUrl}
						<a href={trackerUrl} onclick={addToRecentSearches}>
							<Button class="w-full">
								<TrendingUp class="mr-2 h-4 w-4" />
								Track Contributions
							</Button>
						</a>
					{:else}
						<Button disabled class="w-full">
							<TrendingUp class="mr-2 h-4 w-4" />
							Track Contributions
						</Button>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Recent Searches Sidebar -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-lg">
					<Clock class="h-4 w-4" />
					Recent Searches
				</CardTitle>
			</CardHeader>
			<CardContent>
				{#if recentSearches.current.length > 0}
					<div class="space-y-2">
						{#each recentSearches.current as search (search.timestamp)}
							<Button
								variant="ghost"
								class="w-full justify-start text-left"
								onclick={() => loadRecentSearch(search)}
							>
								<div class="flex w-full items-center justify-between">
									<div class="flex flex-col">
										<span class="font-medium">{search.username}</span>
										<span class="text-muted-foreground text-xs">{search.year}</span>
									</div>
									<span class="text-muted-foreground text-xs">
										{new Date(search.timestamp).toLocaleDateString()}
									</span>
								</div>
							</Button>
						{/each}
					</div>
				{:else}
					<p class="text-muted-foreground text-sm">No recent searches</p>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- Info Cards -->
	<div class="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
		<Card>
			<CardContent class="flex flex-col items-center justify-center p-6 text-center">
				<div class="bg-primary/10 mb-2 rounded-full p-3">
					<TrendingUp class="text-primary h-6 w-6" />
				</div>
				<h3 class="font-semibold">Detailed Stats</h3>
				<p class="text-muted-foreground text-sm">View commits, PRs, issues, and code reviews</p>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="flex flex-col items-center justify-center p-6 text-center">
				<div class="bg-primary/10 mb-2 rounded-full p-3">
					<svg class="text-primary h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"
						></path>
					</svg>
				</div>
				<h3 class="font-semibold">Contribution Heatmap</h3>
				<p class="text-muted-foreground text-sm">GitHub-style calendar visualization</p>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="flex flex-col items-center justify-center p-6 text-center">
				<div class="bg-primary/10 mb-2 rounded-full p-3">
					<svg class="text-primary h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
						></path>
					</svg>
				</div>
				<h3 class="font-semibold">Repository Insights</h3>
				<p class="text-muted-foreground text-sm">Top repositories and languages used</p>
			</CardContent>
		</Card>
	</div>
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={githubContributionTrackerHowToUse.title}
	description={githubContributionTrackerHowToUse.description}
	tabs={githubContributionTrackerHowToUse.tabs}
	showFooterHelpText={githubContributionTrackerHowToUse.showFooterHelpText}
/>
