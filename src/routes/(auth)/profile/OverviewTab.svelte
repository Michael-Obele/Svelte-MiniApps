<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
	import { Progress } from '@/ui/progress';
	import { Button } from '@/ui/button';
	import { Code, Zap, Award, Activity, Clock } from '@lucide/svelte';
	import UserProfileCard from './UserProfileCard.svelte';
	import UpcomingFeaturesList from './UpcomingFeaturesList.svelte';
	import FavoriteAppList from './FavoriteAppList.svelte';
	import { projects, done } from '$lib';
	import { persisted } from 'svelte-persisted-store';
	import { onMount } from 'svelte';
	import { PersistedState } from 'runed';
	import { appUsageTracker, appLastUsed } from '$lib/states.svelte';
	import { getFavoriteApps, getRecentActivity } from '$lib/utils';
	import * as Sheet from '@/ui/sheet/index.js';
	import RecentActivityCard from './RecentActivityCard.svelte';

	// Persisted stores for user activity and favorites
	interface UserActivity {
		app: string;
		date: string;
	}

	type FavoriteApp = {
		appLink: string;
		usageCount: number;
		appName: string;
		appDescription: string;
	};

	// Type definition for recent activity array
	interface RecentActivity {
		appLink: string;
		date: string;
		appName: string;
	}

	// State for recent activity and favorite apps
	let recentActivities: RecentActivity[] = $state([]);
	let favoriteApps: FavoriteApp[] = $state([]);
	let totalUsageCount = $state(0);
	let lastActiveDate = $state('');

	// Stats for dashboard
	const stats = $state({
		completedApps: done.length,
		totalApps: projects.length,
		progress: Math.round((done.length / projects.length) * 100),
		streak: 0,
		level: 0,
		points: 0,
		totalUsage: 0,
		uniqueAppsUsed: 0
	});

	// Calculate streak based on recent activity
	function calculateStreak() {
		// Get the app usage data
		const appLastUsedData = JSON.parse(localStorage.getItem('app-last-used') || '{}');
		if (Object.keys(appLastUsedData).length === 0) return 0;

		// Convert to array of dates
		const dates = Object.values(appLastUsedData)
			.map((dateStr) => {
				const date = new Date(dateStr as string);
				return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
			})
			.sort((a, b) => b - a);

		if (dates.length === 0) return 0;

		// Get today's date (reset time to midnight for comparison)
		const today = new Date();
		const todayMidnight = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		).getTime();

		// If no activity today, no current streak
		if (dates[0] !== todayMidnight) return 0;

		let streak = 1;
		let currentDate = todayMidnight;

		// Check for consecutive days
		for (let i = 1; i < dates.length; i++) {
			const prevDate = currentDate - 86400000; // Previous day (86400000 = 24 * 60 * 60 * 1000)

			// If we find this date in our sorted dates array, increment streak
			if (dates.includes(prevDate)) {
				streak++;
				currentDate = prevDate;
			} else {
				break; // Streak is broken
			}
		}

		return streak;
	}

	// Calculate level based on total usage
	function calculateLevel(totalUsage: number) {
		// Every 50 app usages increases level
		return Math.floor(totalUsage / 50) + 1;
	}

	// Calculate points based on total usage
	function calculatePoints(totalUsage: number) {
		// 10 points per app usage
		return totalUsage * 10;
	}

	// Store projects data in localStorage for utility functions
	function storeProjectsData() {
		const projectsData = projects.map((project) => ({
			title: project.title,
			details: project.details,
			link: project.link
		}));

		localStorage.setItem('projects', JSON.stringify(projectsData));
	}

	// Get total app usage count
	function getTotalUsageCount() {
		const appUsageData = JSON.parse(localStorage.getItem('app-usage-tracker') || '{}');
		return Object.values(appUsageData).reduce((sum: number, count) => sum + (count as number), 0);
	}

	// Get number of unique apps used
	function getUniqueAppsUsed() {
		const appUsageData = JSON.parse(localStorage.getItem('app-usage-tracker') || '{}');
		return Object.keys(appUsageData).length;
	}

	// Get last active date
	function getLastActiveDate() {
		const appLastUsedData = JSON.parse(localStorage.getItem('app-last-used') || '{}');
		if (Object.keys(appLastUsedData).length === 0) return '';

		const dates = Object.values(appLastUsedData)
			.map((dateStr) => new Date(dateStr as string))
			.sort((a, b) => b.getTime() - a.getTime());

		return dates[0].toISOString();
	}

	onMount(() => {
		// Store projects data for utility functions
		storeProjectsData();

		// Get recent activity and favorite apps
		recentActivities = getRecentActivity(5);
		favoriteApps = getFavoriteApps(3);

		// Get usage statistics
		const totalUsage = getTotalUsageCount();
		const uniqueApps = getUniqueAppsUsed();
		lastActiveDate = getLastActiveDate();

		// Update stats
		stats.streak = calculateStreak();
		stats.totalUsage = totalUsage;
		stats.uniqueAppsUsed = uniqueApps;
		stats.level = calculateLevel(totalUsage);
		stats.points = calculatePoints(totalUsage);
	});
</script>

<!-- Container with improved responsive spacing -->
<div class="space-y-8 px-2 sm:px-6 lg:px-8">
	<!-- Stats Cards with better spacing and alignment -->
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
		<Card class="overflow-hidden">
			<CardHeader class="p-3 pb-0 sm:p-4 sm:pb-2">
				<CardTitle class="text-xs font-medium sm:text-sm">Completed Apps</CardTitle>
			</CardHeader>
			<CardContent class="p-3 pt-2 sm:p-4 sm:pt-2">
				<div class="text-base font-bold sm:text-2xl">{stats.completedApps}/{stats.totalApps}</div>
				<Progress value={stats.progress} class="mt-2" />
				<p class="mt-2 text-xs text-muted-foreground">{stats.progress}% of total projects</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Current Streak</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-2">
					<div class="text-2xl font-bold">{stats.streak} days</div>
					<Zap class="h-5 w-5 text-yellow-500" />
				</div>
				<p class="mt-2 text-xs text-muted-foreground">Keep it going!</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Total App Usage</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-2">
					<div class="text-2xl font-bold">{stats.totalUsage}</div>
					<Activity class="h-5 w-5 text-blue-500" />
				</div>
				<p class="mt-2 text-xs text-muted-foreground">{stats.uniqueAppsUsed} unique apps used</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Developer Level</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-2">
					<div class="text-2xl font-bold">Level {stats.level}</div>
					<Award class="h-5 w-5 text-purple-500" />
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					{stats.level * 50 - stats.totalUsage} more uses to next level
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Profile and Activity section with improved responsive layout -->
	<div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
		<!-- User Profile Card with full width on mobile -->
		<div class="lg:col-span-1">
			<UserProfileCard />
		</div>
		<!-- Activity card that spans two columns on larger screens -->
		<div class="lg:col-span-2">
			<RecentActivityCard {recentActivities} />
		</div>
	</div>

	<!-- Bottom section with better alignment and spacing -->
	<div class="mx-auto flex flex-col gap-6 md:flex-row md:gap-6 lg:gap-10">
		<!-- Upcoming Apps with equal flex distribution -->
		<Card class="flex-1">
			<CardHeader class="p-4">
				<CardTitle class="text-lg sm:text-xl">Upcoming Apps</CardTitle>
				<CardDescription>New apps coming soon</CardDescription>
			</CardHeader>
			<CardContent class="max-h-[400px] overflow-y-auto p-4">
				<UpcomingFeaturesList />
			</CardContent>
		</Card>

		<!-- Favorite Apps with equal flex distribution -->
		<Card class="flex-1">
			<CardHeader class="p-4">
				<CardTitle class="text-lg sm:text-xl">Favorite Apps</CardTitle>
				<CardDescription>Apps you use the most</CardDescription>
			</CardHeader>
			<CardContent class="p-4">
				{#if favoriteApps.length > 0}
					<div class="space-y-3 sm:space-y-4">
						{#each favoriteApps as app}
							<div
								class="group flex flex-row items-start gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50 sm:p-4"
							>
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500 sm:h-10 sm:w-10"
								>
									<Award class="h-4 w-4 sm:h-5 sm:w-5" />
								</div>
								<div class="flex-1">
									<div
										class="flex flex-col items-start justify-between sm:flex-row sm:items-center"
									>
										<h4 class="font-medium">{app.appName}</h4>
										<div class="text-xs text-muted-foreground sm:text-sm">
											<span>{app.usageCount} uses</span>
										</div>
									</div>
									<p class="mt-1 text-xs text-muted-foreground sm:text-sm">{app.appDescription}</p>
									<div class="mt-2 flex items-center justify-end sm:mt-3">
										<Button
											variant="outline"
											size="sm"
											class="h-7 gap-1 text-xs opacity-100 sm:h-8 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
											href="/apps/{app.appLink}"
										>
											Open App
										</Button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex items-center justify-center p-4 text-muted-foreground">
						No favorite apps yet
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
