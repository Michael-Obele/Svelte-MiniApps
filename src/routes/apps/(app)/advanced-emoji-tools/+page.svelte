<script lang="ts">
	import { siteimage, siteurl, sitename } from '$lib';
	import * as emoji from 'node-emoji';
	import { toast } from 'svelte-sonner';

	interface EmojiResult {
		emoji: string;
		name: string;
	}

	type SearchResults = Array<EmojiResult>;

	let inputText = $state<string>('');
	let outputText = $state<string>('');
	let searchQuery = $state<string>('');
	let searchResults = $state<SearchResults>([]);
	let randomEmoji = $state<EmojiResult>(emoji.random());

	function emojify(): void {
		outputText = emoji.emojify(inputText);
	}

	function unemojify(): void {
		outputText = emoji.unemojify(inputText);
	}

	function strip(): void {
		outputText = emoji.strip(inputText);
	}

	function search(): void {
		searchResults = emoji.search(searchQuery);
	}

	function getRandomEmoji(): void {
		randomEmoji = emoji.random();
	}

	function findEmoji(input: string): EmojiResult | undefined {
		return emoji.find(input);
	}

	function hasEmoji(input: string): boolean {
		return emoji.has(input);
	}

	async function copyToClipboard(text: string, message: string = 'Copied to clipboard!'): Promise<void> {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(message);
		} catch (err) {
			toast.error('Failed to copy to clipboard');
		}
	}
</script>

<svelte:head>
	<title>Advanced Emoji Tools</title>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta
		name="description"
		content="An advanced toolset for working with emojis. Convert text to emojis, search for emojis, and more."
	/>
	<link rel="canonical" href="{siteurl}apps/advanced-emoji-tools" />

	<!-- Social Media / Open Graph Meta Tags -->
	<meta property="og:title" content="Advanced Emoji Tools" />
	<meta property="og:description" content="Convert text to emojis, search for emojis, and more." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{siteurl}apps/advanced-emoji-tools" />
	<meta property="og:image" content={siteimage} />
	<meta property="og:site_name" content={sitename} />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-center text-4xl font-bold text-slate-800 dark:text-slate-200">Advanced Emoji Tools</h1>

	<!-- Text Input Section -->
	<div class="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
		<h2 class="mb-4 text-2xl font-semibold text-slate-700 dark:text-slate-300">Text Transformation</h2>
		<textarea
			bind:value={inputText}
			class="mb-4 w-full rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-700"
			rows="4"
			placeholder="Enter text here..."
		></textarea>
		<div class="flex flex-wrap gap-2">
			<button
				onclick={emojify}
				class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
			>
				Emojify
			</button>
			<button
				onclick={unemojify}
				class="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
			>
				Unemojify
			</button>
			<button
				onclick={strip}
				class="rounded-md bg-slate-500 px-4 py-2 text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700"
			>
				Strip Emojis
			</button>
		</div>
		{#if outputText}
			<div class="mt-4 rounded-md bg-slate-100 p-4 dark:bg-slate-700">
				<div class="mb-2 flex items-center justify-between">
					<h3 class="font-semibold text-slate-700 dark:text-slate-300">Output:</h3>
					<button
						onclick={() => copyToClipboard(outputText)}
						class="rounded-md bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
					>
						Copy
					</button>
				</div>
				<p class="break-words text-slate-600 dark:text-slate-400">{outputText}</p>
			</div>
		{/if}
	</div>

	<!-- Emoji Search Section -->
	<div class="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
		<h2 class="mb-4 text-2xl font-semibold text-slate-700 dark:text-slate-300">Emoji Search</h2>
		<div class="flex gap-2">
			<input
				bind:value={searchQuery}
				class="flex-1 rounded-md border border-slate-300 p-2 dark:border-slate-600 dark:bg-slate-700"
				placeholder="Search emojis..."
			/>
			<button
				onclick={search}
				class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
			>
				Search
			</button>
		</div>
		{#if searchResults.length > 0}
			<div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each searchResults as result}
					<button
						onclick={() => copyToClipboard(result.emoji, `Copied ${result.name}!`)}
						class="group rounded-md bg-slate-100 p-4 text-center transition-all hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
					>
						<span class="text-2xl group-hover:scale-110 group-active:scale-95">{result.emoji}</span>
						<p class="mt-2 truncate text-sm text-slate-600 dark:text-slate-400" title={result.name}>
							{result.name}
						</p>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Random Emoji Section -->
	<div class="mb-8 rounded-lg bg-white p-6 text-center shadow-lg dark:bg-slate-800">
		<h2 class="mb-4 text-2xl font-semibold text-slate-700 dark:text-slate-300">Random Emoji</h2>
		<button
			onclick={() => copyToClipboard(randomEmoji.emoji, `Copied ${randomEmoji.name}!`)}
			class="group mx-auto mb-4 block rounded-lg p-4 transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
		>
			<div class="text-6xl group-hover:scale-110 group-active:scale-95">{randomEmoji.emoji}</div>
			<p class="mt-2 text-slate-600 dark:text-slate-400">{randomEmoji.name}</p>
		</button>
		<button
			onclick={getRandomEmoji}
			class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
		>
			Get Random Emoji
		</button>
	</div>
</div>