<script lang="ts">
	import * as emoji from 'node-emoji';
	let randomEmoji = emoji.random();
	import { Clipboard, RefreshCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { copyToClipboard } from '@/utils';
	function generateRandomEmoji() {
		randomEmoji = emoji.random();
	}
	

	
</script>

<svelte:head>
	<title>Random Emoji Generator - Svelte MiniApps</title>
	<meta
		name="description"
		content="Generate random emojis with our Random Emoji Generator. Click the button to get a new emoji. Perfect for fun and productivity."
	/>
	<meta property="og:title" content="Random Emoji Generator - Svelte MiniApps" />
	<meta
		property="og:description"
		content="Generate random emojis with our Random Emoji Generator. Click the button to get a new emoji. Perfect for fun and productivity."
	/>
	<meta property="og:url" content="https://svelte-apps.me/apps/random-emoji-generator" />
	<meta property="og:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<link rel="canonical" href="https://svelte-apps.me/apps/random-emoji-generator" />
	<meta name="twitter:title" content="Random Emoji Generator - Svelte MiniApps" />
	<meta name="keywords" content="Random Emoji, Emoji Generator, Fun, Productivity, Svelte Apps" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:description"
		content="Generate random emojis with our Random Emoji Generator. Click the button to get a new emoji. Perfect for fun and productivity."
	/>
	<meta name="twitter:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="UTF-8" />
	<meta name="robots" content="index, follow" />
	<script type="application/ld+json">
		{
			"@context": "http://schema.org",
			"@type": "WebApplication",
			"name": "Random Emoji Generator",
			"url": "https://svelte-apps.me/apps/random-emoji-generator",
			"description": "Generate random emojis with our Random Emoji Generator. Click the button to get a new emoji. Perfect for fun and productivity."
		}
	</script>
</svelte:head>

<div class="min-h-screen">
	<h1 class="px-5 py-10 text-center text-4xl font-bold text-gray-800 dark:text-green-300">
		Welcome
		to the Random Emoji Generator!
	</h1>
	<div class="flex flex-col items-center justify-center">
		<p class="mb-8 text-center text-lg text-gray-700 dark:text-green-200">
			Click the Button below to generate a random emoji.
		</p>
		<Button
			class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
			onclick={generateRandomEmoji}
		>
			Generate Random Emoji
		</Button>
		{#if randomEmoji.emoji}
			<div class="flex flex-col items-center">
				<h2 class="mt-4 text-2xl font-semibold text-gray-800 dark:text-green-300 md:text-3xl">
					{randomEmoji.emoji}
				</h2>
				<h3 class="mt-2 text-lg capitalize text-gray-700 dark:text-green-200 md:text-xl">
					{randomEmoji.name.split('_').join(' ')}
				</h3>
			</div>
			<Button
				variant="secondary"
				class="mt-4 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-500"
				type="button"
				onclick={() => copyToClipboard(randomEmoji.emoji)}
				aria-label="Copy emoji to clipboard"
			>
				<Clipboard class="h-6 w-6" />
			</Button>
		{/if}
	</div>
</div>
