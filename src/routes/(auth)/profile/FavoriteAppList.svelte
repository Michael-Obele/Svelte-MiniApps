<script lang="ts">
	import { ScrollArea } from '@/ui/scroll-area/index.js';
	import { Button } from '@/ui/button';
	import { done, projects } from '$lib';
	import { Star, ExternalLink, Heart, Activity } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { getFavoriteApps } from '$lib/utils';

	// Define the type for favorite app items
	type FavoriteApp = {
		appLink: string;
		usageCount: number;
		appName: string;
		appDescription: string;
	};

	// State for favorite apps
	let favoriteApps: FavoriteApp[] = [];

	onMount(() => {
		// Get favorite apps data from our utility function
		favoriteApps = getFavoriteApps(5);
	});
</script>

<!--
@component
## Svelte Component: Favorite App List
This component displays a list of a user's favorite mini-apps, allowing quick access to frequently used applications.

## Key Features
- **Display Favorite Apps**: Shows a list of apps that the user has marked as favorites.
- **Visual Indication**: Uses a star icon to denote favorite apps.
- **Quick Access**: Provides direct links to the user's favorite applications.
- **Usage Statistics**: Shows how many times the user has used each favorite app.

## Data Source
Uses app usage tracking data to determine favorite apps based on usage count.
-->

<ScrollArea class="h-[300px] pr-4">
	<div class="space-y-4">
		{#if favoriteApps.length > 0}
			{#each favoriteApps as app}
				<div
					class="group flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500"
					>
						<Star class="h-5 w-5" />
					</div>

					<div class="flex-1">
						<div class="flex items-center justify-between">
							<h4 class="font-medium">{app.appName}</h4>
							<div class="flex items-center gap-1 text-xs text-muted-foreground">
								<Activity class="h-3 w-3 text-blue-500" />
								<span>{app.usageCount} uses</span>
							</div>
						</div>

						<p class="mt-1 text-sm text-muted-foreground">
							{app.appDescription}
						</p>

						<div class="mt-3 flex items-center justify-end">
							<Button
								variant="outline"
								size="sm"
								class="h-8 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
								href="/apps/{app.appLink}"
							>
								<ExternalLink class="h-3 w-3" />
								<span>Open App</span>
							</Button>
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<div class="flex items-center justify-center py-8 text-muted-foreground">
				<p>No favorite apps yet. Start using apps to see your favorites here!</p>
			</div>
		{/if}
	</div>
</ScrollArea>
