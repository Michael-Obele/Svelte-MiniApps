<script lang="ts">
	import TaskCard from './TaskCard.svelte';
	import { done, type Project } from '@/index';

	interface Props {
		items: Project[];
	}

	let { items }: Props = $props();
</script>

<div class="mx-12 my-8 flex h-fit flex-col gap-5 md:grid md:grid-cols-2">
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

