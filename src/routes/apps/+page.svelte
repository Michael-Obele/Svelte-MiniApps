<script lang="ts">
	import List from './List.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { filter } from '$lib/utils';
	import Input from '$lib/components/ui/input/input.svelte';
	import BlurInText from '@/components/blocks/BlurInText.svelte';
	import { Command } from 'lucide-svelte';
	import * as Cmd from '$lib/components/ui/command/index.js';

	function setFilterValue(filterValue: string): () => void {
		return () => {
			filter.set(filterValue);
		};
	}

	let app = $state('');

	// Function to focus the input when Ctrl+K is pressed
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey && event.key === 'k') {
			event.preventDefault();
			document.getElementById('app-search')?.focus();
		}
	}

	// Add event listener for keydown
	$effect(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<BlurInText>
	<h1 class="my-8 text-center text-4xl font-bold">Explore Our Mini Applications</h1>
</BlurInText>

<div class="flex flex-wrap items-center justify-center py-4 md:py-8">
	<Button
		onclick={setFilterValue('all')}
		class={`mb-3 me-3 rounded-md px-5 py-2.5 text-center text-base font-medium focus:outline-none focus:ring-4 ${
			$filter === 'all'
				? 'border border-white bg-green-300 text-green-900 hover:border-green-200 hover:bg-green-700 focus:ring-green-300 dark:border-green-900 dark:bg-green-900 dark:text-white dark:hover:border-green-600 dark:hover:bg-green-500 dark:focus:ring-green-800'
				: 'border border-green-600 bg-white text-green-700 hover:bg-green-700 hover:text-white focus:ring-green-300 dark:border-green-500 dark:bg-gray-900 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white dark:focus:ring-green-800'
		}`}
	>
		All
	</Button>
	<div class="relative order-last mx-5 mb-2 w-fit md:order-none">
		<Input
			id="app-search"
			type="text"
			name="app"
			bind:value={app}
			placeholder="Find App..."
			class="rounded-md border border-blue-300 px-3 py-2 placeholder-blue-500 focus:border-green-500 focus:outline-none focus:ring-green-500 focus-visible:ring-green-600 sm:text-sm"
		/>
		<div class="absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-bold text-gray-400">
			<Cmd.Shortcut
				class="flex items-center justify-center rounded-sm bg-gray-700 p-[0.1rem] text-gray-200 dark:bg-gray-800 dark:text-gray-300"
				aria-roledescription="Press Ctrl+K to search"><Command class="size-3" />k</Cmd.Shortcut
			>
			<!-- <Command class="size-4 text-gray-400" aria-roledescription="Press Ctrl+K to search" /> + K -->
		</div>
	</div>
	<Button
		onclick={setFilterValue('done')}
		class="mb-3 me-3 rounded-md px-5 py-2.5 text-center text-base font-medium focus:outline-none focus:ring-4 {$filter ===
		'done'
			? 'border border-white bg-green-300 text-green-900 hover:border-green-200 hover:bg-green-700 focus:ring-green-300 dark:border-green-900 dark:bg-green-900 dark:text-white dark:hover:border-green-600 dark:hover:bg-green-500 dark:focus:ring-green-800'
			: 'border border-green-600 bg-white text-green-700 hover:bg-green-700 hover:text-white focus:ring-green-300 dark:border-green-500 dark:bg-gray-900 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white dark:focus:ring-green-800'}"
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
