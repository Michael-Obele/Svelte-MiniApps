<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Code,
		Zap,
		Award,
		Activity,
		Clock,
		TrendingUp,
		Target,
		Star,
		Trophy,
		Flame,
		Sparkles
	} from 'lucide-svelte';
	import UserProfileCard from './UserProfileCard.svelte';
	import UpcomingFeaturesList from './UpcomingFeaturesList.svelte';
	import FavoriteAppList from './FavoriteAppList.svelte';
	import { projects, done } from '$lib/index.svelte';
	import { onMount } from 'svelte';
	import { getFavoriteApps, getRecentActivity } from '$lib/utils';
	import RecentActivityCard from './RecentActivityCard.svelte';

	// Type definitions
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

	interface RecentActivity {
		appLink: string;
		date: string;
		appName: string;
	}

	interface Achievement {
		id: string;
		title: string;
		description: string;
		icon: typeof Trophy;
		unlocked: boolean;
		progress?: number;
		maxProgress?: number;
	}

	// State for recent activity and favorite apps
	let recentActivities: RecentActivity[] = $state([]);
	let favoriteApps: FavoriteApp[] = $state([]);
	let totalUsageCount = $state(0);
	let lastActiveDate = $state('');

	// Stats for dashboard
	let stats = $state({
		completedApps: done().length,
		totalApps: projects().length,
		progress: Math.round((done().length / projects().length) * 100),
		streak: 0,
		level: 0,
		points: 0,
		totalUsage: 0,
		uniqueAppsUsed: 0
	});

	// Achievements
	let achievements = $state<Achievement[]>([
		{
			id: 'first-use',
			title: 'First Steps',
			description: 'Use your first app',
			icon: Star,
			unlocked: false
		},
		{
			id: 'explorer',
			title: 'Explorer',
			description: 'Use 5 different apps',
			icon: Target,
			unlocked: false,
			progress: 0,
			maxProgress: 5
		},
		{
			id: 'power-user',
			title: 'Power User',
			description: 'Use apps 50 times',
			icon: Zap,
			unlocked: false,
			progress: 0,
			maxProgress: 50
		},
		{
			id: 'streak-master',
			title: 'Streak Master',
			description: 'Maintain a 7-day streak',
			icon: Flame,
			unlocked: false,
			progress: 0,
			maxProgress: 7
		},
		{
			id: 'champion',
			title: 'Champion',
			description: 'Reach Level 5',
			icon: Trophy,
			unlocked: false,
			progress: 0,
			maxProgress: 5
		}
	]);

	// Calculate streak based on recent activity
	function calculateStreak() {
		const appLastUsedData = JSON.parse(localStorage.getItem('app-last-used') || '{}');
		if (Object.keys(appLastUsedData).length === 0) return 0;

		const dates = Object.values(appLastUsedData)
			.map((dateStr) => {
				const date = new Date(dateStr as string);
				return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
			})
			.sort((a, b) => b - a);

		if (dates.length === 0) return 0;

		const today = new Date();
		const todayMidnight = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		).getTime();

		if (dates[0] !== todayMidnight) return 0;

		let streak = 1;
		let currentDate = todayMidnight;

		for (let i = 1; i < dates.length; i++) {
			const prevDate = currentDate - 86400000;
			if (dates.includes(prevDate)) {
				streak++;
				currentDate = prevDate;
			} else {
				break;
			}
		}

		return streak;
	}

	// Calculate level based on total usage
	function calculateLevel(totalUsage: number) {
		return Math.floor(totalUsage / 50) + 1;
	}

	// Calculate points based on total usage
	function calculatePoints(totalUsage: number) {
		return totalUsage * 10;
	}

	// Store projects data in localStorage for utility functions
	function storeProjectsData() {
		const projectsData = projects().map((project) => ({
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

	// Update achievements based on stats
	function updateAchievements() {
		achievements = achievements.map((achievement) => {
			switch (achievement.id) {
				case 'first-use':
					return { ...achievement, unlocked: stats.totalUsage > 0 };
				case 'explorer':
					return {
						...achievement,
						unlocked: stats.uniqueAppsUsed >= 5,
						progress: Math.min(stats.uniqueAppsUsed, 5)
					};
				case 'power-user':
					return {
						...achievement,
						unlocked: stats.totalUsage >= 50,
						progress: Math.min(stats.totalUsage, 50)
					};
				case 'streak-master':
					return {
						...achievement,
						unlocked: stats.streak >= 7,
						progress: Math.min(stats.streak, 7)
					};
				case 'champion':
					return {
						...achievement,
						unlocked: stats.level >= 5,
						progress: Math.min(stats.level, 5)
					};
				default:
					return achievement;
			}
		});
	}

	// Points to next level
	let pointsToNextLevel = $derived(stats.level * 50 - stats.totalUsage);

	// Unlocked achievements count
	let unlockedCount = $derived(achievements.filter((a) => a.unlocked).length);

	onMount(() => {
		storeProjectsData();
		recentActivities = getRecentActivity(5);
		favoriteApps = getFavoriteApps(3);

		const totalUsage = getTotalUsageCount();
		const uniqueApps = getUniqueAppsUsed();
		lastActiveDate = getLastActiveDate();

		stats.streak = calculateStreak();
		stats.totalUsage = totalUsage;
		stats.uniqueAppsUsed = uniqueApps;
		stats.level = calculateLevel(totalUsage);
		stats.points = calculatePoints(totalUsage);

		updateAchievements();
	});
</script>

<div class="space-y-8">
	<!-- Stats Cards Grid -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
		<!-- Completed Apps -->
		<Card.Root class="relative overflow-hidden">
			<div class="from-primary/5 to-primary/10 absolute inset-0 bg-gradient-to-br"></div>
			<Card.Header class="relative pb-2">
				<Card.Title class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
					<Code class="size-4" />
					Completed Apps
				</Card.Title>
			</Card.Header>
			<Card.Content class="relative">
				<div class="text-3xl font-bold">{stats.completedApps}/{stats.totalApps}</div>
				<Progress value={stats.progress} class="mt-3 h-2" />
				<p class="text-muted-foreground mt-2 text-xs">{stats.progress}% complete</p>
			</Card.Content>
		</Card.Root>

		<!-- Current Streak -->
		<Card.Root class="relative overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10"></div>
			<Card.Header class="relative pb-2">
				<Card.Title class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
					<Flame class="size-4 text-orange-500" />
					Current Streak
				</Card.Title>
			</Card.Header>
			<Card.Content class="relative">
				<div class="flex items-baseline gap-1">
					<span class="text-3xl font-bold">{stats.streak}</span>
					<span class="text-muted-foreground text-sm">days</span>
				</div>
				<p class="text-muted-foreground mt-2 text-xs">
					{#if stats.streak > 0}
						🔥 Keep it going!
					{:else}
						Start your streak today!
					{/if}
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Total Usage -->
		<Card.Root class="relative overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10"></div>
			<Card.Header class="relative pb-2">
				<Card.Title class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
					<Activity class="size-4 text-blue-500" />
					Total Usage
				</Card.Title>
			</Card.Header>
			<Card.Content class="relative">
				<div class="text-3xl font-bold">{stats.totalUsage}</div>
				<p class="text-muted-foreground mt-2 text-xs">
					{stats.uniqueAppsUsed} unique apps explored
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Developer Level -->
		<Card.Root class="relative overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10"></div>
			<Card.Header class="relative pb-2">
				<Card.Title class="text-muted-foreground flex items-center gap-2 text-sm font-medium">
					<Trophy class="size-4 text-purple-500" />
					Level
				</Card.Title>
			</Card.Header>
			<Card.Content class="relative">
				<div class="flex items-baseline gap-2">
					<span class="text-3xl font-bold">{stats.level}</span>
					<Badge variant="secondary" class="text-xs">{stats.points} XP</Badge>
				</div>
				<p class="text-muted-foreground mt-2 text-xs">
					{pointsToNextLevel} more uses to level up
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Achievements Section -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2">
						<Sparkles class="size-5 text-yellow-500" />
						Achievements
					</Card.Title>
					<Card.Description>
						{unlockedCount} of {achievements.length} unlocked
					</Card.Description>
				</div>
				<Badge variant="outline" class="gap-1">
					<Trophy class="size-3" />
					{unlockedCount}/{achievements.length}
				</Badge>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				{#each achievements as achievement (achievement.id)}
					<div
						class="relative flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all {achievement.unlocked
							? 'bg-primary/5 border-primary/20'
							: 'opacity-60'}"
					>
						<div
							class="flex size-12 items-center justify-center rounded-full {achievement.unlocked
								? 'bg-primary/10 text-primary'
								: 'bg-muted text-muted-foreground'}"
						>
							<achievement.icon class="size-6" />
						</div>
						<div>
							<p class="text-sm font-medium">{achievement.title}</p>
							<p class="text-muted-foreground text-xs">{achievement.description}</p>
						</div>
						{#if achievement.maxProgress && !achievement.unlocked}
							<Progress
								value={((achievement.progress ?? 0) / achievement.maxProgress) * 100}
								class="mt-1 h-1.5 w-full"
							/>
							<p class="text-muted-foreground text-xs">
								{achievement.progress}/{achievement.maxProgress}
							</p>
						{/if}
						{#if achievement.unlocked}
							<Badge variant="default" class="absolute -top-1 -right-1 size-5 p-0">✓</Badge>
						{/if}
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Profile and Activity Section -->
	<div class="grid gap-6 lg:grid-cols-3">
		<div class="lg:col-span-1">
			<UserProfileCard />
		</div>
		<div class="lg:col-span-2">
			<RecentActivityCard {recentActivities} />
		</div>
	</div>

	<!-- Bottom Section -->
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Upcoming Apps -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<TrendingUp class="size-5" />
					Upcoming Apps
				</Card.Title>
				<Card.Description>New apps coming soon</Card.Description>
			</Card.Header>
			<Card.Content class="max-h-[400px] overflow-y-auto">
				<UpcomingFeaturesList />
			</Card.Content>
		</Card.Root>

		<!-- Favorite Apps -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Star class="size-5 text-yellow-500" />
					Favorite Apps
				</Card.Title>
				<Card.Description>Apps you use the most</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if favoriteApps.length > 0}
					<div class="space-y-3">
						{#each favoriteApps as app (app.appLink)}
							<div
								class="group hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-all"
							>
								<div
									class="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500"
								>
									<Award class="size-5" />
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center justify-between gap-2">
										<h4 class="truncate font-medium">{app.appName}</h4>
										<Badge variant="secondary" class="shrink-0 text-xs">
											{app.usageCount} uses
										</Badge>
									</div>
									<p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
										{app.appDescription}
									</p>
									<Button
										variant="ghost"
										size="sm"
										class="mt-2 h-7 gap-1 px-2 text-xs"
										href="/apps/{app.appLink}"
									>
										Open App →
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-muted-foreground flex flex-col items-center justify-center py-8">
						<Star class="mb-2 size-8 opacity-50" />
						<p>No favorite apps yet</p>
						<p class="text-xs">Start using apps to see your favorites here</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
