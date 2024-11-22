<script lang="ts">
	import TaskCard from './TaskCard.svelte';
	import { done, type Project } from '$lib/index';

	export let items: Project[];
</script>

<div class="mx-12 my-8 flex h-fit flex-col gap-5 md:grid md:grid-cols-2">
	{#each items as item}
		{#if done.includes(item.title)}
			<a href={'/apps/' + item.title.replace(/\s+/g, '-').toLowerCase()}>
				<TaskCard {item} />
			</a>
		{:else}
			<TaskCard {item} />
		{/if}
	{/each}
</div>

<!-- <a
				class:pointer-events-none={!done.includes(item.title)}
				href={'/apps/' + item.title.replace(/\s+/g, '-').toLowerCase()}
				class=""
			></a> -->
