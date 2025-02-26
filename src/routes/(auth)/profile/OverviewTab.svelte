<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Progress } from "$lib/components/ui/progress";
	import { Button } from "$lib/components/ui/button";
	import { Code, Zap, Award } from "lucide-svelte";
	import UserProfileCard from './UserProfileCard.svelte';
	import UpcomingFeaturesList from './UpcomingFeaturesList.svelte';
	import FavoriteAppList from './FavoriteAppList.svelte';
	import { projects, done } from '$lib';
	import { persisted } from 'svelte-persisted-store';
	import { onMount } from 'svelte';
	import { PersistedState } from "runed";
	
	// Persisted stores for user activity and favorites
	interface Activity {
		app: string;
		date: string;
	}
	
	type FavoriteApp = {
		title: string;
		description: string;
		link: string;
		usageCount: number;
	};
	
	const recentActivity: { current: Activity[] } = new PersistedState('recent-activity', []);
	let favoriteApps: { current: FavoriteApp[] } = new PersistedState('favorite-apps', []);
	
	// Stats for dashboard
	const stats = $state({
		completedApps: done.length,
		totalApps: projects.length,
		progress: Math.round((done.length / projects.length) * 100),
		streak: 0,
		level: 0,
		points: 0
	});
	
	// Calculate streak based on recent activity
	function calculateStreak() {
		if (!recentActivity.current.length) return 0;
		
		// Sort activities by date
		const sortedActivities = [...recentActivity.current].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		// Get today's date and reset time to compare just the dates
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		
		// Check if there's activity today
		const latestActivity = new Date(sortedActivities[0]?.date);
		latestActivity.setHours(0, 0, 0, 0);
		
		// If no activity today, streak is broken
		if (latestActivity.getTime() !== today.getTime()) {
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			
			// Check if there was activity yesterday
			if (latestActivity.getTime() !== yesterday.getTime()) {
				return 0; // Streak broken
			}
		}
		
		// Count consecutive days
		let streak = 1;
		let currentDate = new Date(today);
		currentDate.setDate(currentDate.getDate() - 1); // Start checking from yesterday
		
		for (let i = 1; i < sortedActivities.length; i++) {
			const activityDate = new Date(sortedActivities[i].date);
			activityDate.setHours(0, 0, 0, 0);
			
			if (activityDate.getTime() === currentDate.getTime()) {
				streak++;
				currentDate.setDate(currentDate.getDate() - 1);
			} else if (activityDate.getTime() < currentDate.getTime()) {
				// Found a gap, continue checking
				currentDate = new Date(activityDate);
				currentDate.setDate(currentDate.getDate() - 1);
			}
		}
		
		return streak;
	}
	
	// Calculate level and points based on completed apps
	function calculateLevelAndPoints() {
		// Base points per app completion
		const basePoints = 50;
		
		// Calculate total points
		const totalPoints = done.length * basePoints;
		
		// Calculate level (1 level per 100 points)
		const level = Math.floor(totalPoints / 100) + 1;
		
		return { level, points: totalPoints };
	}
	
	// Initialize data on mount
	onMount(() => {
		// Initialize recent activity if empty
		if (!recentActivity.current || recentActivity.current.length === 0) {
			// Mock data for initial setup
			recentActivity.current = [
				{ app: 'QR Code Generator', date: new Date().toISOString() },
				{ app: 'Budget Tracker', date: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
				{ app: 'Markdown Editor', date: new Date(Date.now() - 86400000 * 3).toISOString() } // 3 days ago
			];
		}
		
		// Initialize favorite apps if empty
		if (!favoriteApps.current || favoriteApps.current.length === 0) {
			// Default favorites based on completed apps
			favoriteApps.current = done.slice(0, 3).map(appLink => {
				const appInfo = projects.find(p => p.link === appLink);
				if (appInfo) {
					return {
						title: appInfo.title,
						description: appInfo.details,
						link: appInfo.link,
						usageCount: Math.floor(Math.random() * 30) + 1 // Random usage count for demo
					};
				} else {
					return {
						title: 'Unknown App',
						description: 'No description available',
						link: '',
						usageCount: 0
					};
				}
			});
		}
		
		// Update stats
		stats.streak = calculateStreak();
		const levelInfo = calculateLevelAndPoints();
		stats.level = levelInfo.level;
		stats.points = levelInfo.points;
	});
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- Stats Cards -->
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Completed Apps</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.completedApps}/{stats.totalApps}</div>
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
				<CardTitle class="text-sm font-medium">Developer Level</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-2">
					<div class="text-2xl font-bold">Level {stats.level}</div>
					<Award class="h-5 w-5 text-purple-500" />
				</div>
				<p class="mt-2 text-xs text-muted-foreground">{100 - (stats.points % 100)} points to next level</p>
			</CardContent>
		</Card>
		
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Skill Points</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.points} XP</div>
				<p class="mt-2 text-xs text-muted-foreground">Earned from completed projects</p>
			</CardContent>
		</Card>
	</div>
	
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- User Profile Card -->
		<div class="md:col-span-1">
			<UserProfileCard />
		</div>
		
		<!-- Recent Activity -->
		<Card class="md:col-span-2">
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>Your latest interactions with Svelte MiniApps</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					{#each recentActivity.current as activity, i}
						{#if i < 3}
							<div class="flex items-start gap-4 border-b pb-4 last:border-0">
								<div class="rounded-full bg-primary/10 p-2">
									<Code class="h-4 w-4 text-primary" />
								</div>
								<div>
									<p class="font-medium">Completed {activity.app}</p>
									<p class="text-sm text-muted-foreground">
										{new Date(activity.date).toLocaleDateString() === new Date().toLocaleDateString() 
											? 'Today' 
											: new Date(activity.date).toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString()
												? 'Yesterday'
												: new Date(activity.date).toLocaleDateString()}
									</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</CardContent>
			<CardFooter>
				<Button variant="outline" class="w-full">View All Activity</Button>
			</CardFooter>
		</Card>
	</div>
	
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Upcoming Apps -->
		<Card>
			<CardHeader>
				<CardTitle>Upcoming Apps</CardTitle>
				<CardDescription>New apps and features coming soon</CardDescription>
			</CardHeader>
			<CardContent>
				<UpcomingFeaturesList />
			</CardContent>
		</Card>
		
		<!-- Favorite Apps -->
		<Card>
			<CardHeader>
				<CardTitle>Favorite Apps</CardTitle>
				<CardDescription>Your bookmarked applications</CardDescription>
			</CardHeader>
			<CardContent>
				<FavoriteAppList />
			</CardContent>
		</Card>
	</div>
</div>
