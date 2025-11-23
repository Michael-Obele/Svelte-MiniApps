<script lang="ts">
	import AppGrid from './AppGrid.svelte';
	import { done } from '$lib/index.svelte';
	import { projects } from '$lib/index.svelte';
	import { persistedLocale } from '$lib/stores/language-store.svelte';

	interface Props {
		filteredBy: string;
	}

	let { filteredBy }: Props = $props();

	// Create locale-aware collator that reacts to language changes
	let collator = $derived(new Intl.Collator(persistedLocale.current));

	// Sort projects alphabetically by title using locale-aware sorting
	let sortedProjects = $derived(projects().sort((a, b) => collator.compare(a.title, b.title)));

	let sortedDoneProjects = $derived(
		projects()
			.filter((item) => done().some((d) => d.name === item.link))
			.sort((a, b) => collator.compare(a.title, b.title))
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
					.sort((a, b) => collator.compare(a.title, b.title))
			: projects()
	);
</script>

{#if filteredBy === 'all'}
	<AppGrid items={sortedProjects} />
{:else if filteredBy === 'done'}
	<AppGrid items={sortedDoneProjects} />
{:else}
	<AppGrid items={filteredProjects} />
{/if}
