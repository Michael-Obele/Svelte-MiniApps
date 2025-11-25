<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Clock, Activity, Zap, Search, Calendar, Download } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { getRecentActivity } from '$lib/utils';

	interface ActivityItem {
		appLink: string;
		date: string;
		appName: string;
	}

	let allActivities = $state<ActivityItem[]>([]);
	let searchQuery = $state('');

	// Filter activities based on search using $derived
	let filteredActivities = $derived.by(() => {
		if (searchQuery.trim() === '') {
			return allActivities;
		} else {
			const query = searchQuery.toLowerCase();
			return allActivities.filter((activity) => activity.appName.toLowerCase().includes(query));
		}
	});

	// Format date to relative time
	function formatActivityDate(dateStr: string) {
		const date = new Date(dateStr);
		const today = new Date().toLocaleDateString();
		const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
		const activityDate = date.toLocaleDateString();

		if (activityDate === today) return 'Today';
		if (activityDate === yesterday) return 'Yesterday';
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Format time
	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Group activities by date
	function groupActivitiesByDate(activities: ActivityItem[]) {
		const groups: Record<string, ActivityItem[]> = {};

		activities.forEach((activity) => {
			const dateKey = formatActivityDate(activity.date);
			if (!groups[dateKey]) {
				groups[dateKey] = [];
			}
			groups[dateKey].push(activity);
		});

		return Object.entries(groups).sort((a, b) => {
			// Sort by date descending (newest first)
			const dateA = new Date(a[1][0].date).getTime();
			const dateB = new Date(b[1][0].date).getTime();
			return dateB - dateA;
		});
	}

	let groupedActivities = $derived(groupActivitiesByDate(filteredActivities));
	let totalActivities = $derived(allActivities.length);

	onMount(() => {
		// Get all activities (not limited)
		allActivities = getRecentActivity(1000);
	});

	// Export to CSV
	function exportToCSV() {
		const headers = ['App Name', 'Date', 'Time'];
		const rows = allActivities.map((activity) => [
			activity.appName,
			formatActivityDate(activity.date),
			formatTime(activity.date)
		]);

		const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `activity-history-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<RouteHead
	title="Activity History - Svelte Mini Apps"
	description="Your complete activity history and app usage."
/>

<div class="space-y-6">
	<!-- Header -->
	<Card.Root>
		<Card.Header>
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<Card.Title class="flex items-center gap-2 text-2xl">
						<Activity class="size-6 text-blue-500" />
						Activity History
					</Card.Title>
					<Card.Description>Complete log of your app usage and interactions</Card.Description>
				</div>
				<div class="flex items-center gap-2">
					<Badge variant="secondary" class="gap-1.5">
						<Calendar class="size-3" />
						{totalActivities} total
					</Badge>
					<Button variant="outline" size="sm" class="gap-1.5" onclick={exportToCSV}>
						<Download class="size-4" />
						Export
					</Button>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<!-- Search -->
			<div class="relative">
				<Search
					class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
				/>
				<Input
					type="text"
					placeholder="Search activities by app name..."
					class="pl-9"
					bind:value={searchQuery}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Activity Timeline -->
	{#if filteredActivities.length > 0}
		<div class="space-y-6">
			{#each groupedActivities as [dateLabel, activities] (dateLabel)}
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-lg font-semibold">{dateLabel}</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="relative space-y-0">
							<!-- Timeline line -->
							<div
								class="absolute top-0 bottom-0 left-4 w-0.5 bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-transparent"
							></div>

							{#each activities as activity (activity.appLink + activity.date)}
								<div
									class="group relative flex items-start gap-4 pb-4 transition-all last:pb-0 hover:translate-x-1"
								>
									<!-- Timeline dot -->
									<div class="relative z-10 flex size-8 shrink-0 items-center justify-center">
										<div
											class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 transition-all group-hover:scale-110"
										></div>
										<div
											class="border-background relative flex size-6 items-center justify-center rounded-full border-2 bg-gradient-to-br from-blue-500 to-purple-500 shadow-md"
										>
											<Zap class="size-3 text-white" />
										</div>
									</div>

									<!-- Activity content -->
									<div
										class="border-primary/10 from-primary/5 min-w-0 flex-1 rounded-lg border bg-gradient-to-r to-transparent p-3 shadow-sm transition-all group-hover:shadow-md"
									>
										<div class="flex items-start justify-between gap-4">
											<div class="min-w-0 flex-1">
												<p class="font-medium">{activity.appName}</p>
												<p class="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
													<Clock class="size-3" />
													<span>{formatTime(activity.date)}</span>
												</p>
											</div>
											<Button
												variant="ghost"
												size="sm"
												href="/apps/{activity.appLink}"
												class="shrink-0 text-xs"
											>
												Open →
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if searchQuery.trim() !== ''}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-16">
				<div class="bg-primary/10 mb-4 rounded-full p-4">
					<Search class="text-muted-foreground size-8" />
				</div>
				<p class="text-lg font-medium">No activities found</p>
				<p class="text-muted-foreground text-sm">Try adjusting your search query</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Content class="flex flex-col items-center justify-center py-16">
				<div class="bg-primary/10 mb-4 rounded-full p-4">
					<Activity class="text-muted-foreground size-8" />
				</div>
				<p class="text-lg font-medium">No activity yet</p>
				<p class="text-muted-foreground text-sm">Start using apps to build your activity history</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
