<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { projects, done, truncateText } from '$lib';

	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
</script>

<!--
@component
## Svelte Component: Mini App List
This component displays a list of available mini-apps that are ready to use. It fetches the list of apps from the `projects` array and filters them based on the `done` array, which indicates completed and usable apps. Each app is presented with its title, a brief description, and an "Open" button to access the app.

## Key Features
- **Dynamic App Listing**: Fetches and displays a list of available mini-apps.
- **Completion Status**: Only displays apps that are marked as "done" in the `done` array.
- **Concise Information**: Presents app title and a truncated description for brevity.
- **Direct App Access**: Provides an "Open" button for each app, linking to its respective route.

## Data Source
Utilizes the `projects` and `done` arrays imported from `$lib` to determine available apps and their completion status.
-->

<Card>
	<CardHeader>
		<CardTitle>Mini Apps</CardTitle>
	</CardHeader>
	<ScrollArea class="h-64 rounded-md">
		<CardContent class="grid gap-4">
			<div class="grid gap-2">
				{#each projects as app}
					{#if done.includes(app.title)}
						<div class="flex items-center justify-between">
							<div>
								<div class="font-semibold">{app.title}</div>
								<div class="text-sm text-muted-foreground">{truncateText(app.details, 65)}</div>
							</div>
							<a href="/apps/{app.title.split(' ').join('-')}">
								<Button size="sm">Open</Button>
							</a>
						</div>
					{/if}
				{/each}
			</div>
		</CardContent>
	</ScrollArea>
</Card>
