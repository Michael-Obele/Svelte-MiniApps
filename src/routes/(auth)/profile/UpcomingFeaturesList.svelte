<script lang="ts">
	import { page } from '$app/state';
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';

	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	import { projects, done, truncateText } from '$lib';
</script>

<!--
@component
## Svelte Component: Favorite App List
This component is intended to display a list of a user's favorite mini-apps. Currently, it serves as a placeholder indicating that this feature is not yet implemented.

## Key Features (Future)
- **Display Favorite Apps**: Show a list of apps that the user has marked as favorites.
- **Visual Indication**: Use a visual indicator, such as a star icon, to denote favorite apps.
- **Interactive List**: Allow users to add or remove apps from their favorites list.

## Current State
As of now, the component displays a "None Yet" message, indicating that the favorite app functionality is not yet implemented.
-->

<Card>
	<CardHeader>
		<CardTitle>Upcoming Apps</CardTitle>
	</CardHeader>
	<CardContent class="grid gap-4">
		<ScrollArea class="h-64 rounded-md">
			{#each projects as app, i}
				{#if !done.includes(app.title)}
					<div class="flex items-center justify-between">
						<div>
							<div class="font-semibold">{app.title}</div>
							<div class="text-sm text-muted-foreground">{truncateText(app.details, 65)}</div>
						</div>
						<div class="text-sm text-muted-foreground">Coming soon</div>
					</div>
					<Separator />
				{/if}
			{/each}
		</ScrollArea>
	</CardContent>
</Card>
