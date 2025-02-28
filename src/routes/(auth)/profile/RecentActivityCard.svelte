<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '@/ui/card';
	import { Button } from '@/ui/button';
	import { Clock } from 'lucide-svelte';
	import * as Sheet from '@/ui/sheet/index.js';

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
</script>

<Card class="relative md:col-span-2">
	<CardHeader>
		<CardTitle>Recent Activity</CardTitle>
		<CardDescription>Your latest interactions with Svelte MiniApps</CardDescription>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			{#if recentActivities.length > 0}
				{#each recentActivities.slice(0, 5) as activity, i}
					<div class="flex items-start gap-4 border-b pb-4 last:border-0">
						<div class="rounded-full bg-primary/10 p-2">
							<Clock class="h-4 w-4 text-primary" />
						</div>
						<div>
							<p class="font-medium">Used {activity.appName}</p>
							<p class="text-sm text-muted-foreground">
								{new Date(activity.date).toLocaleDateString() === new Date().toLocaleDateString()
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
				{/each}
			{:else}
				<div class="flex items-center justify-center py-4 text-muted-foreground">
					<p>No recent activity yet. Start using apps to see your activity here!</p>
				</div>
			{/if}
		</div>
	</CardContent>
	<CardFooter class="absolute bottom-0 left-0 right-0">
		<Sheet.Root>
			<Sheet.Trigger class="flex h-full w-full items-center justify-center">
				<Button variant="outline" class="w-full">View All Activity</Button>
			</Sheet.Trigger>
			<Sheet.Content>
				<Sheet.Header>
					<Sheet.Title>View All Activity</Sheet.Title>
					<Sheet.Description>
						{#if recentActivities.length > 0}
							{#each recentActivities as activity, i}
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
							{/each}
						{:else}
							<div class="flex items-center justify-center py-4 text-muted-foreground">
								<p>No recent activity yet. Start using apps to see your activity here!</p>
							</div>
						{/if}
					</Sheet.Description>
				</Sheet.Header>
			</Sheet.Content>
		</Sheet.Root>
	</CardFooter>
</Card>
