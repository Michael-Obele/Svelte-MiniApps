<script lang="ts">
	import TaskCard from './TaskCard.svelte';
	import { done, type Project } from '$lib/index';

	interface Props {
		items: Project[];
	}

	let { items }: Props = $props();
</script>

<div class="mx-auto my-8 flex h-fit flex-col gap-5 px-16 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
	{#each items as item}
		{#if done.includes(item.link)}
			<a href={'/apps/' + item.link}>
				<TaskCard {item} />
			</a>
		{:else}
			<TaskCard {item} />
		{/if}
	{/each}
</div>

