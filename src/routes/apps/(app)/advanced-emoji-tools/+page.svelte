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
	let emojiCheckInput = $state<string>('');
	let emojiCheckResult = $state<{exists: boolean; found?: {emoji: string; key: string;}}>();

	function emojify(): void {
		outputText = emoji.emojify(
			convertToEmojiFormat(inputText)
		);
	}

	function unemojify(): void {
		outputText = emoji.unemojify(inputText);
	}

	function strip(): void {
		outputText = emoji.strip(inputText);
	}

	function stripText(): void {
		if (!inputText) {
			outputText = '';
			return;
		}
		// First convert text to emoji format
		const emojiFormatted = convertToEmojiFormat(inputText);
		// Then only keep the emoji shortcodes
		const emojiOnly = emojiFormatted
			.split(' ')
			.filter(word => /^:\w+:/.test(word))
			.join(' ');
		outputText = emojiOnly;
	}

	function search(): void {
		searchResults = emoji.search(searchQuery);
	}

	function getRandomEmoji(): void {
		randomEmoji = emoji.random();
	}

	function findEmoji(input: string):  {emoji: string; key: string; }  | undefined {
		return emoji.find(input);
	}

	function hasEmoji(input: string): boolean {
		return emoji.has(input);
	}

	function convertToEmojiFormat(text:string): string {
		// Split the input text into words
		const words = text.split(' ');
		
		// Process each word
		const processedWords = words.map(word => {
			// Extract any punctuation
			const punctuation = word.match(/[.,!?]$/)?.[0] || '';
			const cleanWord = word.replace(/[.,!?]/g, '');
			
			// First wrap the word in colons
			let processedWord = `:${cleanWord}:${punctuation}`;
			
			// Check if it's an actual emoji word
			if (!emoji.find(cleanWord)) {
				// If it's not an emoji, remove the colons
				processedWord = cleanWord + punctuation;
			}
			
			return processedWord;
		});
		
		const result = processedWords.join(' ');
		return result;
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
				class="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
			>
				Unemojify
			</button>
			<button
				onclick={strip}
				class="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
			>
				Strip Emojis
			</button>
			<button
				onclick={stripText}
				class="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
			>
				Keep Only Emojis
			</button>
		</div>
		{#if outputText}
			<div class="mt-4 rounded-md bg-slate-100 p-4 dark:bg-slate-700">
				<div class="flex items-center justify-between">
					<p class="text-lg">{outputText}</p>
					<button
						onclick={() => copyToClipboard(outputText)}
						class="ml-4 rounded-md bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500"
					>
						Copy
					</button>
				</div>
			</div>
		{/if}

		<!-- Emoji Check Section -->
		<div class="mt-8 rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
			<h2 class="mb-4 text-2xl font-semibold text-slate-800 dark:text-slate-200">Emoji Checker</h2>
			<div class="flex gap-4">
				<input
					type="text"
					bind:value={emojiCheckInput}
					placeholder="Enter a word to check for emoji..."
					class="flex-1 rounded-md border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-700"
				/>
				<button
					onclick={() => {
						const found = findEmoji(emojiCheckInput);
						const exists = hasEmoji(emojiCheckInput);
						emojiCheckResult = { exists, found };
					}}
					class="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					Check Emoji
				</button>
			</div>
			{#if emojiCheckResult}
				<div class="mt-4 rounded-md bg-slate-100 p-4 dark:bg-slate-700">
					{#if emojiCheckResult.exists}
						<p class="text-green-600 dark:text-green-400">
							✓ This word has an emoji!
							{#if emojiCheckResult.found}
								<span class="ml-2">
									Emoji: {emojiCheckResult.found.emoji} (:{emojiCheckResult.found.key}:)
								</span>
							{/if}
						</p>
					{:else}
						<p class="text-red-600 dark:text-red-400">✗ This word does not have an emoji</p>
					{/if}
				</div>
			{/if}
		</div>
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