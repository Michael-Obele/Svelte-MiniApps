<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@/ui/button/index.js';
	import Input from '@/ui/input/input.svelte';

	import { AudioLines } from 'lucide-svelte';

	import NoWord from '$lib/assets/not-found.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { site } from '$lib';
	import RouteHead from '$lib/components/RouteHead.svelte';

	interface Props {
		//
		form: ActionData;
	}

	let { form }: Props = $props();
	let isLoading = $state(false);

	interface DictionaryEntry {
		title?: string;
		message?: string;
		resolution?: string;
		word?: string;
		// Add other properties as needed
	}

	interface FormState {
		data?: DictionaryEntry;
		error?: boolean;
		// Other form state properties
	}

	let currentMeaning: DictionaryEntry | undefined;

	let Meaning = form?.data;

	let searchTerm = '';

	// let fetchMeaning = async () => {
	// 	let response: any = await _fetchDictionaryEntry(searchTerm);
	// 	if (response && response.length > 0) {
	// 		currentMeaning = response[0];
	// 	} else {
	// 		currentMeaning = response;
	// 	}
	// };

	// Start form submission process.
	const handleSubmit: SubmitFunction = () => {
		isLoading = true; // Indicate submission is in progress.
		toast.loading('Submitting...'); // Show loading toast.

		return async ({ update, result }) => {
			if (result.type === 'failure') {
				toast.dismiss(); // Dismiss all toasts.
				toast.error('Error'); // Show error toast.
			} else {
				toast.dismiss(); // Dismiss all toasts.
				toast.success('Success', {
					action: {
						label: 'OK',
						onClick: () => toast.dismiss()
					}
				}); // Show success toast.
			}

			await update(); // Wait for update to finish.
			isLoading = false; // Submission process ends.
		};
	};
</script>

<RouteHead
	title="Svelte MiniApps - English Dictionary App"
	description="Look up words and their meanings with our English Dictionary App. Explore definitions, synonyms, antonyms, and more. Built with SvelteKit for a fast and engaging experience."
	keywords="English Dictionary, Word Lookup, Definitions, Synonyms, Antonyms, Svelte, SvelteKit, Dictionary App"
	route="/apps/english-dictionary-app"
	image={site.image}
/>

<form
	use:enhance={handleSubmit}
	method="POST"
	class="mx-auto flex max-w-2xl flex-col justify-center px-4"
>
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold text-gray-800 dark:text-white">English Dictionary</h1>
		<p class="text-lg text-gray-600 dark:text-gray-300">Explore the world of words together.</p>
	</div>

	<div class="flex flex-col gap-4 sm:flex-row">
		<Input
			type="text"
			name="word"
			value={form?.word ?? ''}
			placeholder="Enter a word"
			class="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-lg shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
		/>
		<Button
			type="submit"
			disabled={isLoading}
			class="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
		>
			{isLoading ? 'Searching...' : 'Find Meaning'}
		</Button>
	</div>
</form>

{#if isLoading}
	<div class="mx-auto my-8 text-center">
		<div
			class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
		></div>
		<p class="mt-2 text-lg text-gray-600 dark:text-gray-300">Searching for meaning...</p>
	</div>
{/if}

<section
	class:hidden={isLoading}
	class="mx-auto my-10 flex max-w-3xl flex-col justify-center space-y-6 px-4"
>
	{#if form?.error}
		<div class="error space-y-4 rounded-lg bg-red-50 p-6 text-center shadow-lg dark:bg-red-900/50">
			<NoWord />
			<h2 class="text-2xl font-bold text-red-800 dark:text-red-200">{form?.title}</h2>
			{#if form?.message}
				<p class="text-lg text-red-700 dark:text-red-300">{form?.message}</p>
			{/if}
			{#if form?.resolution}
				<p class="text-sm text-red-600 dark:text-red-400">{form?.resolution}</p>
			{/if}
		</div>
	{:else if form?.data}
		{#each form.data as item}
			<article class="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
				<header
					class="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900"
				>
					<h1 class="text-center text-3xl font-bold text-gray-900 dark:text-white">
						{item?.word}
					</h1>
					{#if item?.phonetic}
						<p class="mt-2 text-center text-lg text-gray-600 dark:text-gray-300">
							{item.phonetic}
						</p>
					{/if}
				</header>

				<div class="p-6">
					{#if item?.phonetics?.length}
						<div class="mb-6 space-y-3">
							{#each item.phonetics as phonetic}
								{#if phonetic.audio}
									<div class="flex items-center gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
										<AudioLines class="h-6 w-6 text-indigo-500" />
										<audio controls src={phonetic.audio} class="h-8"></audio>
										{#if phonetic.text}
											<span class="text-sm text-gray-600 dark:text-gray-300">{phonetic.text}</span>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					{/if}

					{#if item?.meanings?.length}
						<div class="space-y-6">
							{#each item.meanings as meaning}
								<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
									<h2 class="mb-3 text-xl font-semibold text-indigo-600 dark:text-indigo-400">
										{meaning.partOfSpeech}
									</h2>
									<div class="space-y-4">
										{#each meaning.definitions as definition, index}
											<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
												<p class="text-gray-800 dark:text-gray-200">
													<span class="mr-2 font-medium text-indigo-600 dark:text-indigo-400"
														>{index + 1}.</span
													>
													{definition.definition}
												</p>
												{#if definition.example}
													<p class="mt-2 text-sm italic text-gray-600 dark:text-gray-400">
														"<span>{definition.example}</span>"
													</p>
												{/if}
												{#if definition.synonyms?.length}
													<div class="mt-2">
														<span class="text-sm font-medium text-gray-600 dark:text-gray-400"
															>Synonyms:</span
														>
														<div class="mt-1 flex flex-wrap gap-2">
															{#each definition.synonyms as synonym}
																<span
																	class="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300"
																>
																	{synonym}
																</span>
															{/each}
														</div>
													</div>
												{/if}
												{#if definition.antonyms?.length}
													<div class="mt-2">
														<span class="text-sm font-medium text-gray-600 dark:text-gray-400"
															>Antonyms:</span
														>
														<div class="mt-1 flex flex-wrap gap-2">
															{#each definition.antonyms as antonym}
																<span
																	class="rounded-full bg-red-50 px-3 py-1 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-300"
																>
																	{antonym}
																</span>
															{/each}
														</div>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{/if}

					{#if item?.origin}
						<div class="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
							<h3 class="font-medium text-gray-900 dark:text-white">Origin</h3>
							<p class="mt-1 text-gray-600 dark:text-gray-300">{item.origin}</p>
						</div>
					{/if}
				</div>

				{#if item?.license}
					<footer
						class="border-t border-gray-200 bg-gray-50 px-6 py-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
					>
						<p>
							License: {item.license.name}
							{#if item.license.url}
								-
								<a
									href={item.license.url}
									class="text-indigo-600 hover:underline dark:text-indigo-400"
									target="_blank"
									rel="noopener noreferrer">View License</a
								>
							{/if}
						</p>
					</footer>
				{/if}
			</article>
		{/each}
	{/if}
</section>
