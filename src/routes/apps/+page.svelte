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
	<Button onclick={setFilterValue('all')} class={$filter === 'all' ? 'active' : 'inactive'}
		>All</Button
	>
	<Input
		type="text"
		name="app"
		bind:value={app}
		placeholder="Find App..."
		class="order-last mx-5 mb-2 w-fit rounded-md border border-blue-300 px-3 py-2 placeholder-blue-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm md:order-none"
	/>
	<Button onclick={setFilterValue('done')} class={$filter === 'done' ? 'active' : 'inactive'}
		>Done</Button
	>
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
