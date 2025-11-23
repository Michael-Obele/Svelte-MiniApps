<script lang="ts">
	import AppCard from './AppCard.svelte';
	import { projects, type Project } from '$lib/index.svelte';

	let { items = projects() } = $props<{ items?: Project[] }>();
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{#each items as project (project.link)}
		<AppCard {project} />
	{/each}
</div>
