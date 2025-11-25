<script lang="ts">
	import { searchDictionary } from '$lib/remote/dictionary.remote';
	import type { DictionaryEntry } from '$lib/remote/dictionary.remote';

	import { Button } from '@/ui/button/index.js';
	import { Input } from '@/ui/input/index.js';
	import { Badge } from '@/ui/badge/index.js';
	import { Skeleton } from '@/ui/skeleton/index.js';
	import * as Card from '@/ui/card/index.js';

	import {
		Search,
		Volume2,
		BookOpen,
		AlertCircle,
		HelpCircle,
		Loader2,
		ExternalLink,
		Quote,
		ArrowRight
	} from '@lucide/svelte';

	import NoWord from '$lib/assets/not-found.svelte';
	import { site } from '$lib/index.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { dictionaryAppHowToUse } from './how-to-use-config';
	import { PersistedState } from 'runed';

	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState('dictionary-app-has-seen-how-to-use', false);

	// Track loading state from form
	let isSearching = $derived(!!searchDictionary.pending);

	// Get results from form
	let result = $derived(searchDictionary.result);
	let entries = $derived(result?.success ? (result.data as DictionaryEntry[]) : null);
	let error = $derived(!result?.success && result?.error ? result.error : null);

	// Helper to play audio
	function playAudio(audioUrl: string) {
		const audio = new Audio(audioUrl);
		audio.play();
	}

	// Get all unique synonyms from definitions
	function getAllSynonyms(definitions: { synonyms?: string[] }[]): string[] {
		const allSynonyms = definitions.flatMap((d) => d.synonyms || []);
		return [...new Set(allSynonyms)].slice(0, 8); // Limit to 8
	}

	// Get all unique antonyms from definitions
	function getAllAntonyms(definitions: { antonyms?: string[] }[]): string[] {
		const allAntonyms = definitions.flatMap((d) => d.antonyms || []);
		return [...new Set(allAntonyms)].slice(0, 8); // Limit to 8
	}
</script>

<RouteHead
	title="Svelte Mini Apps - English Dictionary App"
	description="Look up words and their meanings with our English Dictionary App. Explore definitions, synonyms, antonyms, and more. Built with SvelteKit for a fast and engaging experience."
	keywords="English Dictionary, Word Lookup, Definitions, Synonyms, Antonyms, Svelte, SvelteKit, Dictionary App"
	route="/apps/english-dictionary-app"
	image={site().image}
/>

<div class="mx-auto max-w-3xl px-4 py-8">
	<!-- Header Section -->
	<header class="mb-8 text-center">
		<div class="mb-4 flex items-center justify-center gap-3">
			<div class="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/50">
				<BookOpen class="size-8 text-indigo-600 dark:text-indigo-400" />
			</div>
			<h1 class="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
				English Dictionary
			</h1>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => (showHowToUse = true)}
				class="shrink-0"
				aria-label="How to use"
			>
				<HelpCircle class="size-5" />
			</Button>
		</div>
		<p class="text-lg text-gray-600 dark:text-gray-300">
			Explore the world of words — definitions, synonyms, and pronunciations.
		</p>
	</header>

	<!-- Search Form -->
	<form {...searchDictionary} class="mb-8">
		<Card.Root class="overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/50">
			<Card.Content class="p-4">
				<div class="flex flex-col gap-3 sm:flex-row">
					<div class="relative flex-1">
						<Search class="text-muted-foreground absolute top-1/2 left-3 size-5 -translate-y-1/2" />
						<Input
							{...searchDictionary.fields.word.as('text')}
							placeholder="Enter a word to search..."
							class="h-12 pl-10 text-lg"
							disabled={isSearching}
						/>
					</div>
					<Button
						type="submit"
						disabled={isSearching}
						class="h-12 gap-2 bg-indigo-600 px-6 text-base hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
					>
						{#if isSearching}
							<Loader2 class="size-5 animate-spin" />
							Searching...
						{:else}
							<Search class="size-5" />
							Find Meaning
						{/if}
					</Button>
				</div>

				<!-- Validation errors -->
				{#each searchDictionary.fields.word.issues() ?? [] as issue, i (i)}
					<p class="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
						<AlertCircle class="size-4" />
						{issue.message}
					</p>
				{/each}
			</Card.Content>
		</Card.Root>
	</form>

	<!-- Loading State -->
	{#if isSearching}
		<div class="space-y-4">
			<Card.Root>
				<Card.Header>
					<Skeleton class="h-8 w-32" />
					<Skeleton class="mt-2 h-4 w-24" />
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex items-center gap-3">
						<Skeleton class="size-10 rounded-lg" />
						<Skeleton class="h-8 w-48" />
					</div>
					<div class="space-y-3">
						<Skeleton class="h-6 w-24" />
						<div class="space-y-2 pl-4">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-4 w-3/4" />
							<Skeleton class="h-4 w-5/6" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Error State -->
	{#if error && !isSearching}
		<Card.Root class="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30">
			<Card.Content class="py-8 text-center">
				<NoWord />
				<h2 class="mt-4 text-xl font-semibold text-red-800 dark:text-red-200">{error.title}</h2>
				{#if error.message}
					<p class="mt-2 text-red-700 dark:text-red-300">{error.message}</p>
				{/if}
				{#if error.resolution}
					<p class="mt-2 text-sm text-red-600 dark:text-red-400">{error.resolution}</p>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Results -->
	{#if entries && !isSearching}
		<div class="space-y-6">
			{#each entries as entry (entry.word)}
				<Card.Root class="overflow-hidden">
					<!-- Word Header -->
					<Card.Header
						class="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 dark:border-gray-800 dark:from-indigo-950/50 dark:to-purple-950/50"
					>
						<div class="flex items-start justify-between">
							<div>
								<Card.Title class="text-3xl font-bold text-gray-900 dark:text-white">
									{entry.word}
								</Card.Title>
								{#if entry.phonetic}
									<Card.Description
										class="mt-1 text-lg font-medium text-indigo-600 dark:text-indigo-400"
									>
										{entry.phonetic}
									</Card.Description>
								{/if}
							</div>
							{#if result?.cached}
								<Badge variant="secondary" class="text-xs">Cached</Badge>
							{/if}
						</div>
					</Card.Header>

					<Card.Content class="space-y-6 p-6">
						<!-- Audio Pronunciations -->
						{#if entry.phonetics?.some((p) => p.audio)}
							<div class="flex flex-wrap items-center gap-2">
								<span class="text-sm font-medium text-gray-600 dark:text-gray-400"
									>Pronunciations:</span
								>
								{#each entry.phonetics.filter((p) => p.audio) as phonetic, i (phonetic.audio || i)}
									<Button
										variant="outline"
										size="sm"
										class="gap-2"
										onclick={() => playAudio(phonetic.audio!)}
									>
										<Volume2 class="size-4" />
										{phonetic.text || 'Play'}
									</Button>
								{/each}
							</div>
						{/if}

						<!-- Meanings -->
						{#each entry.meanings as meaning, i (meaning.partOfSpeech + i)}
							<div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
								<div class="mb-3 flex items-center gap-2">
									<Badge variant="default" class="bg-indigo-600 dark:bg-indigo-500">
										{meaning.partOfSpeech}
									</Badge>
									{#if meaning.synonyms?.length}
										<span class="text-xs text-gray-500">
											{meaning.definitions.length} definition{meaning.definitions.length > 1
												? 's'
												: ''}
										</span>
									{/if}
								</div>

								<ol class="space-y-3">
									{#each meaning.definitions.slice(0, 5) as definition, index (index)}
										<li class="flex gap-3">
											<span
												class="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
											>
												{index + 1}
											</span>
											<div class="flex-1">
												<p class="text-gray-800 dark:text-gray-200">{definition.definition}</p>
												{#if definition.example}
													<p
														class="mt-1 flex items-start gap-2 text-sm text-gray-600 italic dark:text-gray-400"
													>
														<Quote class="mt-0.5 size-3 shrink-0" />
														<span>"{definition.example}"</span>
													</p>
												{/if}
											</div>
										</li>
									{/each}
								</ol>

								{#if meaning.definitions.length > 5}
									<p class="mt-3 text-sm text-gray-500">
										+{meaning.definitions.length - 5} more definitions
									</p>
								{/if}

								<!-- Synonyms & Antonyms for this meaning -->
								{#if getAllSynonyms(meaning.definitions).length > 0 || getAllAntonyms(meaning.definitions).length > 0}
									<div class="mt-4 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
										{#if getAllSynonyms(meaning.definitions).length > 0}
											<div class="flex flex-wrap items-center gap-2">
												<span class="text-sm font-medium text-gray-600 dark:text-gray-400"
													>Synonyms:</span
												>
												{#each getAllSynonyms(meaning.definitions) as synonym (synonym)}
													<Badge variant="outline" class="text-emerald-600 dark:text-emerald-400">
														{synonym}
													</Badge>
												{/each}
											</div>
										{/if}
										{#if getAllAntonyms(meaning.definitions).length > 0}
											<div class="flex flex-wrap items-center gap-2">
												<span class="text-sm font-medium text-gray-600 dark:text-gray-400"
													>Antonyms:</span
												>
												{#each getAllAntonyms(meaning.definitions) as antonym (antonym)}
													<Badge variant="outline" class="text-rose-600 dark:text-rose-400">
														{antonym}
													</Badge>
												{/each}
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/each}

						<!-- Origin -->
						{#if entry.origin}
							<div class="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30">
								<h3
									class="mb-2 flex items-center gap-2 font-medium text-amber-800 dark:text-amber-200"
								>
									<ArrowRight class="size-4" />
									Word Origin
								</h3>
								<p class="text-amber-700 dark:text-amber-300">{entry.origin}</p>
							</div>
						{/if}
					</Card.Content>

					<!-- Footer with License -->
					{#if entry.license || entry.sourceUrls?.length}
						<Card.Footer
							class="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
						>
							<div
								class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
							>
								{#if entry.license}
									<span>
										License: {entry.license.name}
										{#if entry.license.url}
											<a
												href={entry.license.url}
												class="ml-1 inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
												target="_blank"
												rel="noopener noreferrer"
											>
												View <ExternalLink class="size-3" />
											</a>
										{/if}
									</span>
								{/if}
								{#if entry.sourceUrls?.length}
									<a
										href={entry.sourceUrls[0]}
										class="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
										target="_blank"
										rel="noopener noreferrer"
									>
										Source <ExternalLink class="size-3" />
									</a>
								{/if}
							</div>
						</Card.Footer>
					{/if}
				</Card.Root>
			{/each}
		</div>
	{/if}

	<!-- Empty State (no search yet) -->
	{#if !result && !isSearching}
		<Card.Root class="border-dashed">
			<Card.Content class="py-12 text-center">
				<div class="mx-auto mb-4 w-fit rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/50">
					<Search class="size-8 text-indigo-600 dark:text-indigo-400" />
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white">Start exploring words</h3>
				<p class="mt-1 text-gray-600 dark:text-gray-400">
					Enter any English word above to discover its meanings, pronunciations, and more.
				</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={dictionaryAppHowToUse.title}
	description={dictionaryAppHowToUse.description}
	tabs={dictionaryAppHowToUse.tabs}
	showFooterHelpText={dictionaryAppHowToUse.showFooterHelpText}
/>
