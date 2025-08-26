<script lang="ts">
	import { page } from '$app/state';
	import { Separator } from '@/ui/separator';
	import { ScrollArea } from '@/ui/scroll-area/index.js';
	import { Badge } from '@/ui/badge';
	import { projects, done, truncateText } from '$lib';
	import { Calendar, Zap, Code, Sparkles, Clock } from '@lucide/svelte';

	// Filter projects that are not yet completed
	let upcomingProjects = $state(projects.filter((project) => !done.includes(project.link)));

	// Calculate total upcoming apps
	const totalUpcoming = $state(projects.filter((p) => !done.includes(p.link)).length);
</script>

<!--
@component
## Svelte Component: Upcoming Apps List
This component displays a list of upcoming mini-apps that are planned for future implementation.

## Key Features
- **App Preview**: Shows a preview of upcoming mini-apps.
- **Difficulty Level**: Displays the difficulty level of each upcoming app.

## Data Source
Uses the `projects` and `done` arrays from the `$lib` to determine which projects are upcoming.
-->

<ScrollArea class="h-[300px] pr-4">
	<div class="space-y-4">
		{#each upcomingProjects as project, i}
			<div class="flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
					{#if project.difficulty === 'easy'}
						<Zap class="h-5 w-5 text-primary" />
					{:else if project.difficulty === 'medium'}
						<Code class="h-5 w-5 text-primary" />
					{:else}
						<Sparkles class="h-5 w-5 text-primary" />
					{/if}
				</div>

				<div class="flex-1">
					<div class="flex items-center justify-between">
						<h4 class="font-medium">{project.title}</h4>
						<Badge
							variant={project.difficulty === 'easy'
								? 'outline'
								: project.difficulty === 'medium'
									? 'secondary'
									: 'default'}
						>
							{project.difficulty}
						</Badge>
					</div>

					<p class="mt-1 text-sm text-muted-foreground">
						{truncateText(project.details, 100)}
					</p>
				</div>
			</div>
		{/each}

		{#if upcomingProjects.length === 0}
			<div class="flex h-[200px] items-center justify-center">
				<p class="text-muted-foreground">All projects are completed!</p>
			</div>
		{/if}
	</div>
</ScrollArea>
