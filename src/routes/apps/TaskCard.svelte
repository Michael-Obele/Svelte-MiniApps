<script lang="ts">
	import Tags from './Tags.svelte';
	import { done } from '$lib/index';
	import { BadgeCheck, HardHat, ArrowRight } from 'lucide-svelte';

	export let item;
</script>

<div
	class="group relative h-full rounded-lg border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800 md:p-12"
>
	<!-- Done check -->
	<span
		class:opacity-100={done.includes(item.title)}
		class:opacity-20={!done.includes(item.title)}
		class="absolute right-5 top-5"
	>
		<BadgeCheck class="h-20 w-20 text-green-800 dark:text-green-400" />
	</span>

	<!-- End of Done check -->
	<div class="flex w-fit flex-col">
		<span
			class={`mb-2 inline-flex w-fit items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${item.difficulty}`}
		>
			<HardHat size="16" class="mx-1" />
			{item.difficulty}
		</span>

		<Tags {item} />
	</div>

	<h2 class="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
		{item.title}
	</h2>
	<p class="mb-4 text-lg font-normal text-gray-500 dark:text-gray-400">
		{item.details}
	</p>
	{#if done.includes(item.title)}
		<a
			href={'/apps/' + item.title.replace(/\s+/g, '-').toLowerCase()}
			class="inline-flex items-center text-lg font-medium text-red-600 group-hover:underline dark:text-red-500"
			>Try now
			<ArrowRight size="22" class="mx-1" />
		</a>
	{/if}
</div>
