<script lang="ts">
	import List from './List.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	import { filter } from '$lib/utils';
	import Input from '$lib/components/ui/input/input.svelte';

	function setFilterValue(filterValue: string): () => void {
		return () => {
			filter.set(filterValue);
		};
	}

	let app = $state('');
</script>

<div class="flex flex-wrap items-center justify-center py-4 md:py-8">
	<Button
		onclick={setFilterValue('all')}
		class={`mb-3 me-3 rounded-md px-5 py-2.5 text-center text-base font-medium focus:outline-none focus:ring-4 ${
			$filter === 'all'
				? 'border border-white bg-green-300 text-green-900 hover:border-green-200 hover:bg-green-700 focus:ring-green-300 dark:border-green-900 dark:bg-green-900 dark:text-white dark:hover:border-green-600 dark:hover:bg-green-500 dark:focus:ring-green-800'
				: 'border border-blue-600 bg-white text-blue-700 hover:bg-blue-700 hover:text-white focus:ring-blue-300 dark:border-blue-500 dark:bg-gray-900 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800'
		}`}
	>
		All
	</Button>
	<Input
		type="text"
		name="app"
		bind:value={app}
		placeholder="Find App..."
		class="order-last mx-5 mb-2 w-fit rounded-md border border-blue-300 px-3 py-2 placeholder-blue-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm md:order-none"
	/>
	<Button
		onclick={setFilterValue('done')}
		class={`mb-3 me-3 rounded-md px-5 py-2.5 text-center text-base font-medium focus:outline-none focus:ring-4 ${
			$filter === 'done'
				? 'border border-white bg-green-300 text-green-900 hover:border-green-200 hover:bg-green-700 focus:ring-green-300 dark:border-green-900 dark:bg-green-900 dark:text-white dark:hover:border-green-600 dark:hover:bg-green-500 dark:focus:ring-green-800'
				: 'border border-blue-600 bg-white text-blue-700 hover:bg-blue-700 hover:text-white focus:ring-blue-300 dark:border-blue-500 dark:bg-gray-900 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800'
		}`}
	>
		Done
	</Button>
</div>
<!-- Filtered List -->
{#if app}
	<List filteredBy={app} />
{:else if $filter === 'all'}
	<List filteredBy="all" />
{:else if $filter === 'done'}
	<List filteredBy="done" />
{/if}
<!-- End of Filtered List -->
