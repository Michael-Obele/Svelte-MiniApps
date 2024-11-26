<script lang="ts">
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
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
		<CardTitle>Favorite Apps</CardTitle>
	</CardHeader>
	<CardContent class="grid gap-4">
		<h3>None Yet</h3>
		<!--  -->
		<!-- <div class="flex items-center justify-between">
			<div>
				<div class="font-semibold">Password Manager</div>
				<div class="text-sm text-muted-foreground">Secure your passwords</div>
			</div>
			<Button size="sm" variant="ghost">
				<StarIcon class="h-4 w-4 fill-white" />
			</Button>
		</div> -->
		<!--  -->
		<!-- <Separator />
		<div class="flex items-center justify-between">
			<div>
				<div class="font-semibold">Note Taking</div>
				<div class="text-sm text-muted-foreground">Jot down your ideas</div>
			</div>
			<Button size="sm" variant="ghost">
				<StarIcon class="h-4 w-4" />
			</Button>
		</div>
		<Separator />
		<div class="flex items-center justify-between">
			<div>
				<div class="font-semibold">Calendar</div>
				<div class="text-sm text-muted-foreground">Manage your schedule</div>
			</div>
			<Button size="sm" variant="ghost">
				<StarIcon class="h-4 w-4" />
			</Button>
		</div> -->
	</CardContent>
</Card>
