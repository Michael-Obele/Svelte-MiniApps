<script lang="ts">
	import Tags from './Tags.svelte';
	import { BadgeCheck, HardHat, ArrowRight, Info } from 'lucide-svelte';
	import { done, type Project } from '@/index';

	export let item: Project;
</script>

<div
	class="group relative h-full rounded-lg border border-gray-200 bg-gray-50 px-6 pb-20 pt-8 dark:border-gray-700 dark:bg-gray-800 md:px-6 md:pb-20 md:pt-5"
>
	<!-- Done check -->
	<span
		class:opacity-100={done.includes(item.link)}
		class:opacity-20={!done.includes(item.link)}
		class="absolute right-5 top-5"
	>
		<BadgeCheck class="size-16 text-green-800 dark:text-green-400" />
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
	{#if done.includes(item.link)}
		<span
			class="absolute bottom-5 inline-flex items-center text-lg font-medium text-red-600 group-hover:underline dark:text-red-500"
			>Try now
			<ArrowRight size="22" class="mx-1" />
		</span>
	{:else}
		<div class="absolute bottom-5 flex flex-row items-center space-x-2">
			<p class="text-lg font-medium text-gray-500 dark:text-gray-400">Coming Soon!</p>
		</div>
	{/if}
</div>
