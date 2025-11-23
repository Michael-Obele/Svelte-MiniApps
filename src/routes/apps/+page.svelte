<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import List from './List.svelte';
	import BlurInText from '@/blocks/BlurInText.svelte';
	import AppGrid from './AppGrid.svelte';
	import AppFilters from './AppFilters.svelte';
	import { filter } from '$lib/states.svelte';
	import { done, projects } from '$lib/index.svelte';

	let app = $state('');
	let searchQuery = $state('');
	let dialogOpen = $state(false);

	// Alphabetically sorted projects (locale-aware)
	let sortedProjects = $derived([...projects()].sort((a, b) => a.title.localeCompare(b.title)));

	// Check if a project is completed
	function isCompleted(link: string): boolean {
		return done().some((d) => d.name === link);
	}
</script>

<RouteHead
	title="Apps | Svelte Mini Apps"
	description="Explore a variety of useful mini applications built with Svelte. Find tools for productivity, entertainment, and more."
	keywords="svelte, mini apps, applications, tools, productivity, entertainment"
	route="/apps"
/>

<div class="container mx-auto min-h-screen px-4 py-12 md:px-6 md:py-24">
	<div class="mb-12 flex flex-col items-center justify-center space-y-4 text-center">
		<BlurInText>
			<h1 class="text-foreground text-3xl font-bold tracking-tighter sm:text-5xl">
				Explore Our Mini Applications
			</h1>
		</BlurInText>
		<p
			class="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
		>
			Discover a collection of powerful tools built with <span
				class="font-semibold text-red-600 dark:text-red-500">Svelte</span
			>.
		</p>
	</div>

	<!-- Enhanced Filter & Search Section -->
	<AppFilters {filter} bind:app bind:searchQuery bind:dialogOpen />

	{#if app}
		<List filteredBy={app} />
	{:else if filter.current === 'all'}
		<AppGrid items={sortedProjects} />
	{:else if filter.current === 'done'}
		<AppGrid items={sortedProjects.filter((p) => isCompleted(p.link))} />
	{/if}
</div>
