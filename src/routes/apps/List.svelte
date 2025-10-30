<script lang="ts">
	import ProjectsGrid from './ProjectsGrid.svelte';
	import { done } from '$lib/index.svelte';
	import { projects } from '$lib/index.svelte';

	interface Props {
		filteredBy: string;
	}

	let { filteredBy }: Props = $props();

	// Sort projects alphabetically by title
	let sortedProjects = $derived(projects().sort((a, b) => a.title.localeCompare(b.title)));

	let sortedDoneProjects = $derived(
		projects()
			.filter((item) => done().some((d) => d.name === item.link))
			.sort((a, b) => a.title.localeCompare(b.title))
	);

	let filteredProjects = $derived(
		filteredBy
			? projects()
					.filter(
						(project) =>
							project.title.toLowerCase().includes(filteredBy.toLowerCase()) ||
							project.details.toLowerCase().includes(filteredBy.toLowerCase()) ||
							project.tag.toLowerCase().includes(filteredBy.toLowerCase()) ||
							project.link.toLowerCase().includes(filteredBy.toLowerCase())
					)
					.sort((a, b) => a.title.localeCompare(b.title))
			: projects()
	);
</script>

{#if filteredBy === 'all'}
	<ProjectsGrid items={sortedProjects} />
{:else if filteredBy === 'done'}
	<ProjectsGrid items={sortedDoneProjects} />
{:else}
	<ProjectsGrid items={filteredProjects} />
{/if}
