<script lang="ts">
	import * as emoji from 'node-emoji';
	import { Clipboard, RefreshCcw } from 'lucide-svelte';
	import { Button } from '@/ui/button/index.js';
	import { copyToClipboard } from '$lib/utils';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';

	let randomEmoji = emoji.random();

	function generateRandomEmoji(): void {
		randomEmoji = emoji.random();
	}
</script>

<RouteHead
	title="Random Emoji Generator - Svelte MiniApps"
	description="Generate random emojis with our Random Emoji Generator. Click the button to get a new emoji. Perfect for fun and productivity."
	keywords="Random Emoji, Emoji Generator, Fun, Productivity, Svelte Apps"
	route="/apps/random-emoji-generator"
	image="https://i.ibb.co/ZhhhnCz/svelte-badge.png"
/>

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
