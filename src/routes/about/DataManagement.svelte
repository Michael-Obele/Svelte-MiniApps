<script lang="ts">
	import Illustration from './Illustration.svelte';

	// Use the direct path to the JSON file instead of importing it
	const bookmark = '/lottie/bookmark.json';

	import { Bomb } from 'lucide-svelte';
	import { dataManagement } from './data';
	import Data from '$lib/assets/Bomb.png?enhanced';

	import Group from './Group.svelte';
</script>

<section id="DataManagement" class="mx-auto mt-8 text-center">
	<header>
		<h2
			class="bold mx-auto my-5 w-fit cursor-pointer text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
		>
			{dataManagement.title}
		</h2>
	</header>
	<Group dir="right">
		{#snippet image()}
			<Illustration image={Data} alt="Data Management & Troubleshooting" />
		{/snippet}

		{#snippet content()}
			<p>
				Our app includes a powerful "Nuke Button" <Bomb class="inline-block h-5 w-5 text-red-500" />
				that allows you to clear all cached data, including service worker caches and local storage.
				This is especially useful if you encounter any caching issues or need to reset the app to its
				default state.
			</p>
		{/snippet}
	</Group>
	<ul class="my-8 space-y-4 text-left">
		{#each dataManagement.features as feature}
			<li
				class="mx-auto flex flex-col items-start border-none border-gray-300 p-3 text-right transition duration-200 ease-in-out dark:border-gray-700 sm:w-fit sm:flex-row"
			>
				<lord-icon
					src={bookmark}
					trigger="loop-on-hover"
					stroke="thick"
					target="li"
					state="hover-draw"
					class="mb-2 size-8 text-muted-foreground transition-colors hover:text-primary sm:mx-2"
					colors="primary:red,secondary:green"
				></lord-icon>
				<span>{feature}</span>
			</li>
		{/each}
	</ul>
	<p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
		{dataManagement.note}
	</p>
</section>
