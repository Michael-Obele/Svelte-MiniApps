<script lang="ts">
	import * as emoji from 'node-emoji';
	import { Clipboard, RefreshCcw } from '@lucide/svelte';
	import { Button } from '@/ui/button/index.js';
	import { copyToClipboard } from '$lib/utils';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import HowToUseDialog from '@/ui/HowToUseDialog.svelte';
	import { randomEmojiGeneratorHowToUse } from './how-to-use-config';
	import { HelpCircle } from '@lucide/svelte';
	import { PersistedState } from 'runed';

	let randomEmoji = $state(emoji.random());
	let showHowToUse = $state(false);
	let hasSeenHowToUse = new PersistedState('random-emoji-generator-has-seen-how-to-use', false);

	function generateRandomEmoji(): void {
		randomEmoji = emoji.random();
	}
</script>

<RouteHead
	title="Random Emoji Generator - Svelte Mini Apps"
	description="Generate random emojis with our Random Emoji Generator. Click the button to get a new emoji. Perfect for fun and productivity."
	keywords="Random Emoji, Emoji Generator, Fun, Productivity, Svelte Apps"
	route="/apps/random-emoji-generator"
	image="https://i.ibb.co/ZhhhnCz/svelte-badge.png"
/>

<div class="container flex min-h-screen flex-col items-center justify-center">
	<div class="mb-4 flex items-center gap-4">
		<h1 class="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">
			Random Emoji Generator
		</h1>
		<Button variant="outline" size="icon" onclick={() => (showHowToUse = true)} class="shrink-0">
			<HelpCircle class="h-4 w-4" />
		</Button>
	</div>

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

<HowToUseDialog
	bind:open={showHowToUse}
	onClose={() => (hasSeenHowToUse.current = true)}
	title={randomEmojiGeneratorHowToUse.title}
	description={randomEmojiGeneratorHowToUse.description}
	tabs={randomEmojiGeneratorHowToUse.tabs}
	showFooterHelpText={randomEmojiGeneratorHowToUse.showFooterHelpText}
/>
