<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle } from '@/ui/card';
	import { Button } from '@/ui/button';
	import { projects, done, truncateText } from '$lib/index.svelte';

	import { ScrollArea } from '@/ui/scroll-area/index.js';
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
