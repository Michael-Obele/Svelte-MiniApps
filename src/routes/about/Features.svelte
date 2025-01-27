<script lang="ts">
	import Illustration from './Illustration.svelte';
	import { features, future, next, reasons, splitDescription, dataManagement } from './data';
	import Why from '$lib/assets/Question 7.png?enhanced';
	import Group from './Group.svelte';
	import Header from './Header.svelte';
	let { id } = $props();
</script>

<section {id}>
	<Header {id}>Why Choose Svelte MiniApps?</Header>
	<Group dir="left">
		{#snippet image()}
			<Illustration image={Why} alt="Why  Choose Svelte MiniApps?" />
		{/snippet}

		{#snippet content()}
			<div id="Features-list" class="mx-auto my-5">
				<ul class="space-y-4 text-left">
					{#each features as feature, i}
						<li
							id={feature.title.split(' ').join('-')}
							class="items-start border-b border-gray-300 p-3 transition duration-200 ease-in-out dark:border-gray-700 md:flex-row md:items-center"
						>
							<lord-icon
								target="li"
								src="https://cdn.lordicon.com/cgzlioyf.json"
								trigger="morph"
								colors="primary:#c71f16,secondary:#109173"
								class="mr-4 h-12 w-12 text-green-500 dark:text-green-400"
							></lord-icon>
							<div class="flex flex-col">
								<span class="text-lg font-semibold text-gray-900 dark:text-white">
									{feature.title}
								</span>
								<span class="ml-4 font-normal text-gray-600 dark:text-gray-300">
									{#each feature.description.split('\n') as line, j}
										<p>{line}</p>
									{/each}
								</span>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{/snippet}
	</Group>
</section>
