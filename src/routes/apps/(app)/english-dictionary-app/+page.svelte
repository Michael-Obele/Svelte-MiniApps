<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import Input from '$lib/components/ui/input/input.svelte';

	import { AudioLines } from 'lucide-svelte';
	import type { UserContext } from '$lib/types';
	import { afterUpdate, getContext } from 'svelte';

	const { userUsername } = getContext<UserContext>('userContext');
	import NoWord from '$lib/assets/not-found.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { siteimage, siteurl } from '$lib';
	//

	export let form: ActionData;
	let isLoading = false;

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

<svelte:head>
	<title>Svelte MiniApps - English Dictionary App</title>
	<meta
		name="description"
		content="Look up words and their meanings with our English Dictionary App. Explore definitions, synonyms, antonyms, and more. Built with SvelteKit for a fast and engaging experience."
	/>
	<meta
		name="keywords"
		content="English Dictionary, Word Lookup, Definitions, Synonyms, Antonyms, Svelte, SvelteKit, Dictionary App"
	/>
	<meta property="og:title" content="Svelte MiniApps - English Dictionary App" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteurl + 'apps/english-dictionary-app'} />
	<meta
		property="og:description"
		content="Look up words and their meanings with our English Dictionary App. Explore definitions, synonyms, antonyms, and more."
	/>
	<meta property="og:image" content={siteimage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Svelte MiniApps - English Dictionary App" />
	<meta
		name="twitter:description"
		content="Look up words and their meanings with our English Dictionary App. Explore definitions, synonyms, antonyms, and more."
	/>
	<meta name="twitter:image" content={siteimage} />
	<link rel="canonical" href={siteurl + 'apps/english-dictionary-app'} />

	<script type="application/ld+json">
        {
            "@context": "http://schema.org",
            "@type": "WebApplication",
            "name": "English Dictionary App",
            "url": siteurl + 'apps/english-dictionary-app', // Use imported siteurl directly
            "description": "An interactive tool for looking up English words and their meanings, including definitions, synonyms, and antonyms.",
            "applicationCategory": "reference",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5", // Replace with your actual rating
                "reviewCount": "100" // Replace with your actual review count
            }
        }
	</script>
</svelte:head>

<form
	use:enhance={handleSubmit}
	method="POST"
	class="mx-auto flex max-w-md flex-col justify-center"
>
	<span class="my-5 ms-3 flex-1 whitespace-nowrap text-center text-xl">
		Welcome,
		{#if userUsername}
			<span class="font-semibold text-green-600 dark:text-green-400"> {userUsername}</span>
		{:else}
			<span class="font-semibold text-gray-700 dark:text-gray-300">Guest</span>
		{/if}!
		<p class="">Let's explore the world of words together.</p>
	</span>
	<Input
		type="text"
		name="word"
		value={form?.word ?? ''}
		placeholder="Enter a word"
		class="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
	/>

	<Button
		type="submit"
		class="mt-4 w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
	>
		Find Meaning
	</Button>
</form>

<h2 class="my-8 bg-green-100 text-center text-2xl text-green-800 dark:bg-red-800 dark:text-white">
	{isLoading ? 'Meaning Loading...' : ''}
</h2>

<section class:hidden={isLoading} class="mx-auto my-10 flex max-w-3xl flex-col justify-center">
	{#if form?.error == true}
		<div
			class="error space-y-5 rounded-lg bg-red-100 p-4 text-center text-red-800 shadow-md dark:bg-red-900 dark:text-red-200"
		>
			<NoWord />
			<h2 class="text-xl font-semibold">{form?.title}</h2>
			<p class="text-md mt-2">{form?.message}</p>
			<p class="mt-1 text-sm text-red-600 dark:text-red-400">{form?.resolution}</p>
		</div>
	{:else if form?.error == false}
		{#each form?.data || [] as item}
			<article class="rounded-lg bg-white p-4 shadow-md dark:bg-gray-900">
				<header>
					<h1 class="mb-2 text-center text-2xl font-bold text-red-600 dark:text-red-400">
						{item?.word}
					</h1>
				</header>
				{#if item?.phonetic}
					<!-- content here -->
					<p class="mb-2 text-lg font-semibold text-green-600 dark:text-green-400">
						Phonetic: <span class="rounded-md bg-gray-200 px-2 py-1 dark:bg-gray-700"
							>{item.phonetic}</span
						>
					</p>
				{/if}
				{#each item?.phonetics || [] as phonetic}
					{#if phonetic.audio}
						<div
							class="mb-2 flex w-fit flex-row items-center space-x-5 rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
						>
							<AudioLines />
							<audio controls src={phonetic.audio} class="ml-4"></audio>
							<p class="text-md mb-1 text-green-600 dark:text-green-400">{phonetic.text}</p>
						</div>
					{/if}
				{/each}
				{#each item?.meanings || [] as data}
					<section>
						<h2 class="mb-1 text-xl font-semibold text-green-600 dark:text-green-400">
							{data.partOfSpeech}
						</h2>
						<ol class="list-inside list-decimal space-y-4 text-green-600 dark:text-green-400">
							{#each data.definitions as definition}
								<li>
									{definition.definition}
									{#if definition.synonyms}
										<ul class="mt-2 list-inside list-disc space-y-1 ps-5">
											<li>Synonyms: {definition.synonyms.join(', ')}</li>
										</ul>
									{/if}
									{#if definition.antonyms}
										<ul class="mt-2 list-inside list-disc space-y-1 ps-5">
											<li>Antonyms: {definition.antonyms.join(', ')}</li>
										</ul>
									{/if}
									{#if definition.example}
										<ul class="mt-2 list-inside list-disc space-y-1 ps-5">
											<li>Example: {definition.example}</li>
										</ul>
									{/if}
								</li>
							{/each}
						</ol>
					</section>
				{/each}
				<footer>
					<p
						class="mt-5 rounded-md bg-white p-2 text-sm text-green-600 shadow-md dark:bg-gray-800 dark:text-green-400"
					>
						License: {item?.license.name} -
						<a
							href={item?.license.url}
							class="text-blue-500 hover:underline dark:text-blue-400"
							target="_blank"
							rel="noopener">{item?.license.url}</a
						>
					</p>
				</footer>
			</article>
			{#if item?.origin}
				<p class="mt-4 text-lg font-semibold text-green-600 dark:text-green-400">
					Origin: {item?.origin}
				</p>
			{/if}
		{/each}
	{/if}
</section>
