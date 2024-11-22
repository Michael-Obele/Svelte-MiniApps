<script lang="ts">
	import ProjectsGrid from './ProjectsGrid.svelte';
	import { done } from '$lib/index';
	import { projects } from '$lib/index';

	export let filteredBy: string;

	// Sort projects alphabetically by title
	let sortedProjects = projects.sort((a, b) => a.title.localeCompare(b.title));
</script>

{#if filteredBy === 'all'}
	<ProjectsGrid items={sortedProjects} />
{:else if filteredBy === 'done'}
	<ProjectsGrid items={projects.filter((item) => done.includes(item.title))} />
{:else}
	<ProjectsGrid
		items={projects.filter((item) => item.title.toLowerCase().includes(filteredBy.toLowerCase()))}
	/>
{/if}
