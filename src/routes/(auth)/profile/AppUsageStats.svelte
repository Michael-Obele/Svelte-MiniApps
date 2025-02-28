<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Button } from '$lib/components/ui/button';
	import { ChartColumn, Activity, Clock, Calendar } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { appUsageTracker } from '@/states.svelte';
	import { projects } from '@/index';

	// Define the type for app usage stats
	type AppUsage = {
		appName: string;
		usageCount: number;
		percentage: number;
		lastUsed: Date | null;
	};

	// State for app usage data
	let appUsageData: AppUsage[] = $state([]);
	let totalUsage = $state(0);
	let lastActiveDate = $state('');
	let mostActiveDay = $state({ day: '', count: 0 });
	let appLastUsedStore = $state<Record<string, string>>({});
	let appUsageStore: Record<string, number> = appUsageTracker.current;


		// Calculate total usage
		totalUsage = Object.values(appUsageStore).reduce((sum, count) => {
			if (typeof count !== 'number') {
				throw new Error('Expected all values in appUsageStore to be numbers');
			}
			return sum + count;
		}, 0);

		// Get last active date
		if (Object.keys(appLastUsedStore).length > 0) {
			const dates = Object.values(appLastUsedStore)
				.map((dateStr) => new Date(dateStr as string))
				.sort((a, b) => b.getTime() - a.getTime());

			lastActiveDate = dates[0].toISOString();
		}

		// Process app usage data
		appUsageData = Object.entries(appUsageStore)
			.map(([appLink, count]) => {
				const appInfo = projects.find((p: any) => p.link === appLink);
				const lastUsed = appLastUsedStore[appLink]?.toString() || null;

				return {
					appName: appInfo?.title || 'Unknown App',
					usageCount: count as number,
					percentage: Math.round(((count as number) / totalUsage) * 100) || 0,
					lastUsed: lastUsed ? new Date(lastUsed) : null
				};
			})
			.sort((a, b) => b.usageCount - a.usageCount);

		// Calculate most active day
		calculateMostActiveDay(appLastUsedStore);


	// Calculate the day of the week with most activity
	function calculateMostActiveDay(appLastUsedStore: Record<string, string>) {
		if (Object.keys(appLastUsedStore).length === 0) return;

		const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		// Count activity by day of week
		Object.values(appLastUsedStore).forEach((dateStr) => {
			const date = new Date(dateStr as string);
			const day = date.getDay(); // 0 = Sunday, 6 = Saturday
			dayCount[day]++;
		});

		// Find the most active day
		let maxCount = 0;
		let maxDay = 0;

		dayCount.forEach((count, day) => {
			if (count > maxCount) {
				maxCount = count;
				maxDay = day;
			}
		});

		mostActiveDay = {
			day: dayNames[maxDay],
			count: maxCount
		};
	}

	// Format date for display
	function formatDate(date: Date) {
		if (!date) return 'Never';

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		if (dateOnly.getTime() === today.getTime()) {
			return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
		} else if (dateOnly.getTime() === yesterday.getTime()) {
			return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
		} else {
			return (
				date.toLocaleDateString() +
				' at ' +
				date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			);
		}
	}
</script>

<div class="space-y-6">
	<!-- Usage Summary Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Total App Usage</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-2">
					<div class="text-2xl font-bold">{totalUsage}</div>
					<Activity class="h-5 w-5 text-blue-500" />
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					Across {appUsageData.length} different apps
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Last Active</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-2">
					<div class="text-2xl font-bold">
						{lastActiveDate ? formatDate(new Date(lastActiveDate)).split(' at ')[0] : 'Never'}
					</div>
					<Clock class="h-5 w-5 text-green-500" />
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					{lastActiveDate
						? formatDate(new Date(lastActiveDate)).includes('at')
							? 'at ' + formatDate(new Date(lastActiveDate)).split('at ')[1]
							: ''
						: 'No activity recorded'}
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardTitle class="text-sm font-medium">Most Active Day</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-2">
					<div class="text-2xl font-bold">{mostActiveDay.day || 'None'}</div>
					<Calendar class="h-5 w-5 text-purple-500" />
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					{mostActiveDay.count} activities on this day
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- App Usage Breakdown -->
	<Card>
		<CardHeader>
			<CardTitle>App Usage Breakdown</CardTitle>
			<CardDescription>Detailed statistics for each app you've used</CardDescription>
		</CardHeader>
		<CardContent>
			{#if appUsageData.length > 0}
				<ScrollArea class="h-[400px] pr-4">
					<div class="space-y-6">
						{#each appUsageData as app}
							<div>
								<div class="mb-1 flex items-center justify-between">
									<div>
										<span class="text-sm font-medium">{app.appName}</span>
										<span class="ml-2 text-xs text-muted-foreground">({app.usageCount} uses)</span>
									</div>
									<span class="text-xs font-medium">{app.percentage}%</span>
								</div>
								<div class="flex items-center gap-4">
									<Progress value={app.percentage} class="h-2 w-full" />
									<div class="min-w-[3rem] text-right text-xs text-muted-foreground">
										Last: {app.lastUsed ? formatDate(app.lastUsed).split(' at ')[0] : 'Never'}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</ScrollArea>
			{:else}
				<div class="flex items-center justify-center py-8 text-muted-foreground">
					<p>No app usage data yet. Start using apps to see statistics here!</p>
				</div>
			{/if}
		</CardContent>
		<CardFooter>
			<div class="flex w-full items-center justify-between">
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<ChartColumn class="h-4 w-4" />
					<span>Usage statistics are updated in real-time</span>
				</div>
				<Button variant="outline" size="sm">Export Data</Button>
			</div>
		</CardFooter>
	</Card>
</div>
