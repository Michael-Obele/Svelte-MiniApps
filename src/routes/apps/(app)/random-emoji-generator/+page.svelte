<script lang="ts">
	import * as emoji from 'node-emoji';
	import { Clipboard, RefreshCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { copyToClipboard } from '@/utils';

	let randomEmoji = emoji.random();

	function generateRandomEmoji(): void {
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

<div class="container flex min-h-screen flex-col items-center justify-center">
	<h1 class="mb-4 text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">
		Random Emoji Generator
	</h1>

	<div class="flex items-center space-x-4">
		<Button variant="default" onclick={generateRandomEmoji} class="flex items-center">
			<RefreshCcw class="mr-2 size-5" />
			Generate
		</Button>

		<Button
			variant="secondary"
			onclick={() => copyToClipboard(randomEmoji.emoji, 'Emoji copied to clipboard')}
			class="flex items-center"
		>
			<Clipboard class="mr-2 size-5" />
			Copy
		</Button>
	</div>

	<div class="mt-6 flex flex-col items-center justify-center space-y-4">
		<p class="text-6xl">{randomEmoji.emoji}</p>
		<p class="text-gray-600 dark:text-gray-300">
			{randomEmoji.name.split('_').join(' ')}
		</p>
	</div>
</div>
