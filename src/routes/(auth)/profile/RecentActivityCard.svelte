<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Clock, Activity, Zap } from 'lucide-svelte';
	import * as Sheet from '$lib/components/ui/sheet';

	// Type definition for recent activity array
	interface RecentActivity {
		appLink: string;
		date: string;
		appName: string;
	}

	interface Props {
		recentActivities?: RecentActivity[];
	}

	let { recentActivities = [] }: Props = $props();

	// Format date to relative time
	function formatActivityDate(dateStr: string) {
		const date = new Date(dateStr);
		const today = new Date().toLocaleDateString();
		const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
		const activityDate = date.toLocaleDateString();

		if (activityDate === today) return 'Today';
		if (activityDate === yesterday) return 'Yesterday';
		return date.toLocaleDateString();
	}

	// Format time
	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<Card.Root class="h-full">
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title class="flex items-center gap-2">
					<Activity class="size-5 text-blue-500" />
					Recent Activity
				</Card.Title>
				<Card.Description>Your latest interactions with Svelte Mini Apps</Card.Description>
			</div>
			{#if recentActivities.length > 5}
				<Sheet.Root>
					<Sheet.Trigger>
						<Button variant="ghost" size="sm" class="gap-1.5">
							View All
							<span class="bg-muted rounded-full px-2 py-0.5 text-xs">
								{recentActivities.length}
							</span>
						</Button>
					</Sheet.Trigger>
					<Sheet.Content>
						<Sheet.Header>
							<Sheet.Title>All Activity</Sheet.Title>
							<Sheet.Description>Complete activity history</Sheet.Description>
						</Sheet.Header>
						<div class="mt-6 space-y-4">
							{#each recentActivities as activity (activity.appLink + activity.date)}
								<div
									class="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition-all"
								>
									<div
										class="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10"
									>
										<Zap class="size-4 text-blue-500" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="font-medium">{activity.appName}</p>
										<p class="text-muted-foreground text-sm">
											{formatActivityDate(activity.date)} at {formatTime(activity.date)}
										</p>
									</div>
								</div>
							{/each}
						</div>
					</Sheet.Content>
				</Sheet.Root>
			{/if}
		</div>
	</Card.Header>
	<Card.Content>
		{#if recentActivities.length > 0}
			<div class="relative space-y-0">
				<!-- Timeline line -->
				<div class="bg-border absolute top-0 bottom-0 left-4 w-0.5"></div>

				{#each recentActivities.slice(0, 5) as activity (activity.appLink + activity.date)}
					<div
						class="group relative flex items-start gap-4 pb-6 transition-all last:pb-0 hover:translate-x-1"
					>
						<!-- Timeline dot -->
						<div class="relative z-10 flex size-8 shrink-0 items-center justify-center">
							<div
								class="bg-muted absolute inset-0 rounded-full transition-all group-hover:scale-110"
							></div>
							<div
								class="border-background relative flex size-6 items-center justify-center rounded-full border-2 bg-blue-500 shadow-md"
							>
								<Zap class="size-3 text-white" />
							</div>
						</div>

						<!-- Activity content -->
						<div
							class="border-border/50 bg-muted/30 min-w-0 flex-1 rounded-lg border p-3 shadow-sm transition-all group-hover:shadow-md"
						>
							<p class="font-medium">{activity.appName}</p>
							<p class="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
								<Clock class="size-3" />
								<span>{formatActivityDate(activity.date)} at {formatTime(activity.date)}</span>
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-muted-foreground flex flex-col items-center justify-center py-12">
				<div class="bg-muted mb-3 rounded-full p-4">
					<Activity class="size-8 opacity-50" />
				</div>
				<p class="font-medium">No recent activity yet</p>
				<p class="text-xs">Start using apps to see your activity here!</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
