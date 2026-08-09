<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import List from './List.svelte';
	import BlurInText from '@/blocks/BlurInText.svelte';
	import AppGrid from './AppGrid.svelte';
	import AppFilters from './AppFilters.svelte';
	import { projects } from '$lib/index.svelte';

	let app = $state('');
	let searchQuery = $state('');

	// Alphabetically sorted projects (locale-aware)
	let sortedProjects = $derived([...projects()].sort((a, b) => a.title.localeCompare(b.title)));
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

	<!-- Search & Jump-to-app Section -->
	<AppFilters bind:app bind:searchQuery />

	{#if app}
		<List filteredBy={app} />
	{:else}
		<AppGrid items={sortedProjects} />
	{/if}
</div>
