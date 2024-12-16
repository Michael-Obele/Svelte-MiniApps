<script lang="ts">
	import ProjectsGrid from './ProjectsGrid.svelte';
	import { done } from '@/index';
	import { projects } from '@/index';

	interface Props {
		filteredBy: string;
	}

	let { filteredBy }: Props = $props();

	// Sort projects alphabetically by title
	let sortedProjects = projects.sort((a, b) => a.title.localeCompare(b.title));
</script>

{#if filteredBy === 'all'}
	<ProjectsGrid items={sortedProjects} />
{:else if filteredBy === 'done'}
	<ProjectsGrid items={projects.filter((item) => done.includes(item.link))} />
{:else}
	<ProjectsGrid
		items={projects.filter((item) => item.title.toLowerCase().includes(filteredBy.toLowerCase()))}
	/>
{/if}
