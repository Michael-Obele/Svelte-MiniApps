<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Clock } from "lucide-svelte";

	// Type definition for recent activity array
	interface RecentActivity {
		appLink: string;
		date: string;
		appName: string;
	}

	export let recentActivities: RecentActivity[] = [];
</script>

<Card class="md:col-span-2">
	<CardHeader>
		<CardTitle>Recent Activity</CardTitle>
		<CardDescription>Your latest interactions with Svelte MiniApps</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			{#if recentActivities.length > 0}
				{#each recentActivities as activity, i}
					{#if i < 5}
						<div class="flex items-start gap-4 border-b pb-4 last:border-0">
							<div class="rounded-full bg-primary/10 p-2">
								<Clock class="h-4 w-4 text-primary" />
							</div>
							<div>
								<p class="font-medium">Used {activity.appName}</p>
								<p class="text-sm text-muted-foreground">
									{new Date(activity.date).toLocaleDateString() ===
									new Date().toLocaleDateString()
										? 'Today'
										: new Date(activity.date).toLocaleDateString() ===
										new Date(Date.now() - 86400000).toLocaleDateString()
										? 'Yesterday'
										: new Date(activity.date).toLocaleDateString()}
									{' at '}
									{new Date(activity.date).toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
						</div>
					{/if}
				{/each}
			{:else}
				<div class="flex items-center justify-center py-4 text-muted-foreground">
					<p>No recent activity yet. Start using apps to see your activity here!</p>
				</div>
			{/if}
		</div>
	</CardContent>
	<CardFooter>
		<Button variant="outline" class="w-full">View All Activity</Button>
	</CardFooter>
</Card>
