<script lang="ts">
	import ProjectsGrid from './ProjectsGrid.svelte';
	import { done } from '$lib/index';
	import { projects } from '$lib/index';

	interface Props {
		filteredBy: string;
	}

	let { filteredBy }: Props = $props();

	// Sort projects alphabetically by title
	let sortedProjects = projects.sort((a, b) => a.title.localeCompare(b.title));

	let filteredProjects = $derived(
		filteredBy 
			? projects.filter(project => 
				project.title.toLowerCase().includes(filteredBy.toLowerCase()) ||
				project.details.toLowerCase().includes(filteredBy.toLowerCase()) ||
				project.tag.toLowerCase().includes(filteredBy.toLowerCase()) ||
				project.link.toLowerCase().includes(filteredBy.toLowerCase())
			)
			: projects
	);
</script>

{#if filteredBy === 'all'}
	<ProjectsGrid items={sortedProjects} />
{:else if filteredBy === 'done'}
	<ProjectsGrid items={projects.filter((item) => done.includes(item.link))} />
{:else}
	<ProjectsGrid
		items={filteredProjects}
	/>
{/if}
