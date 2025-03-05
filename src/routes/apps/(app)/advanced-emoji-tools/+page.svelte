<script lang="ts">
	import { site } from '$lib';
	import * as emoji from 'node-emoji';
	import RouteHead from '$lib/components/RouteHead.svelte';
	import { toast } from 'svelte-sonner';
	import * as Card from '@/ui/card';
	import * as Tabs from '@/ui/tabs';
	import { Button } from '@/ui/button';
	import { Input } from '@/ui/input';
	import { Textarea } from '@/ui/textarea';
	import { Badge } from '@/ui/badge';
	import { Separator } from '@/ui/separator';
	import * as ContextMenu from '@/ui/context-menu/index.js';
	import { copyToClipboard } from '$lib/utils';
	import { fade, fly } from 'svelte/transition';

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
	let emojiCheckResult = $state<{ exists: boolean; found?: { emoji: string; key: string } }>();
	let activeTab = $state<string>('random');

	function emojify(): void {
		// First unemojify to convert any existing emojis to shortcodes
		const withShortcodes = emoji.unemojify(inputText);
		const textWithShortcodes = withShortcodes.replace(/:([\w-]+):/g, '$1');
		// Then convert the text to proper emoji format
		const formatted = convertToEmojiFormat(textWithShortcodes);
		// Finally emojify everything
		outputText = emoji.emojify(formatted);
	}

	function unemojify(): void {
		// First convert emojis to shortcodes
		const withColons = emoji.unemojify(inputText);
		// Then remove the colons from the shortcodes
		outputText = withColons.replace(/:([\w-]+):/g, '$1');
	}

	function strip(): void {
		outputText = emoji.strip(inputText);
	}

	function stripText(): void {
		if (!inputText) {
			outputText = '';
			return;
		}
		// First convert any emojis to shortcode format
		const withShortcodes = emoji.unemojify(inputText);
		// Extract only the emoji shortcodes and convert them back to emoji
		const matches = withShortcodes.match(/:\w+:/g) || [];
		const emojis = matches.map((match) => emoji.emojify(match));
		outputText = emojis.join(' ');
	}

	function search(): void {
		searchResults = emoji.search(searchQuery);
	}

	function getRandomEmoji(): void {
		randomEmoji = emoji.random();
	}

	function findEmoji(input: string): { emoji: string; key: string } | undefined {
		return emoji.find(input);
	}

	function hasEmoji(input: string): boolean {
		return emoji.has(input);
	}

	function convertToEmojiFormat(text: string): string {
		// Split the input text into words
		const words = text.split(' ');

		// Process each word
		const processedWords = words.map((word) => {
			// Store original word to check capitalization
			const originalWord = word;
			const lowerCased = word.toLowerCase();

			// Extract any punctuation
			const punctuation = lowerCased.match(/[.,!?]$/)?.[0] || '';
			const cleanWord = lowerCased.replace(/[.,!?]/g, '');

			// First wrap the word in colons
			let processedWord = `:${cleanWord}:${punctuation}`;

			// Check if it's an actual emoji word
			if (!emoji.find(cleanWord)) {
				// If it's not an emoji, remove the colons and restore original capitalization
				processedWord = originalWord;
			}

			return processedWord;
		});

		const result = processedWords.join(' ');
		return result;
	}

	const handleSearchKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			search();
		}
	};

	const handleCheckKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			const found = findEmoji(emojiCheckInput);
			const exists = hasEmoji(emojiCheckInput);
			emojiCheckResult = { exists, found };
		}
	};
</script>

<RouteHead
	title="Advanced Emoji Tools"
	description="An advanced toolset for working with emojis. Convert text to emojis, search for emojis, and more."
	keywords="emoji tools, emoji converter, emoji search, text to emoji, emoji generator"
	route="/apps/advanced-emoji-tools"
	image={site.image}
/>

<div class="container mx-auto space-y-8 px-4 py-8">
	<div class="space-y-4 text-center">
		<h1 class="text-4xl font-bold tracking-tight">Advanced Emoji Tools ✨</h1>
		<p class="text-muted-foreground">Transform, search, and explore the world of emojis</p>
		<p class="text-sm text-muted-foreground">Tap any emoji to copy it to your clipboard 📋</p>
	</div>

	<Tabs.Root value={activeTab} class="w-full" onValueChange={(val) => (activeTab = val)}>
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="transform">Transform</Tabs.Trigger>
			<Tabs.Trigger value="check">Check</Tabs.Trigger>
			<Tabs.Trigger value="search">Search</Tabs.Trigger>
			<Tabs.Trigger value="random">Random</Tabs.Trigger>
		</Tabs.List>

		<div class="mt-6">
			<Tabs.Content value="transform">
				<Card.Root class="w-full">
					<Card.Header>
						<Card.Title>Text Transformation</Card.Title>
						<Card.Description>Convert your text to and from emoji format</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<Textarea bind:value={inputText} placeholder="Enter text here..." rows={4} />
						<div class="flex flex-wrap gap-2">
							<Button variant="default" onclick={emojify}>
								<span class="mr-1">✨</span> Emojify
							</Button>
							<Button variant="secondary" onclick={unemojify}>
								<span class="mr-1">📝</span> Unemojify
							</Button>
							<Button variant="destructive" onclick={strip}>
								<span class="mr-1">🗑️</span> Strip Emojis
							</Button>
							<Button variant="outline" onclick={stripText}>
								<span class="mr-1">🎯</span> Keep Only Emojis
							</Button>
						</div>
						{#if outputText}
							<div class="relative">
								<Separator class="my-4" />
								<div class="rounded-lg bg-muted p-4">
									<div class="flex items-center justify-between">
										<p class="font-mono text-lg">{outputText}</p>
										<Button variant="ghost" size="sm" onclick={() => copyToClipboard(outputText)}>
											📋 Copy
										</Button>
									</div>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="check">
				<Card.Root>
					<Card.Header>
						<Card.Title>Emoji Checker</Card.Title>
						<Card.Description>Check if a word has an emoji equivalent</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="flex gap-2">
							<Input
								onkeydown={handleCheckKeyDown}
								bind:value={emojiCheckInput}
								placeholder="Enter a word to check..."
							/>
							<Button
								onclick={() => {
									const found = findEmoji(emojiCheckInput);
									const exists = hasEmoji(emojiCheckInput);
									emojiCheckResult = { exists, found };
								}}>Check</Button
							>
						</div>
						{#if emojiCheckResult}
							<div class="rounded-lg bg-muted p-4">
								{#if emojiCheckResult.exists}
									<div class="text-success flex items-center gap-2">
										<span class="text-2xl">✓</span>
										<div>
											<p class="font-semibold">Found an emoji!</p>
											{#if emojiCheckResult.found}
												<div class="mt-2 flex items-center gap-2">
													<span class="text-3xl">{emojiCheckResult.found.emoji}</span>
													<Badge variant="outline">:{emojiCheckResult.found.key}:</Badge>
												</div>
											{/if}
										</div>
									</div>
								{:else}
									<div class="flex items-center gap-2 text-destructive">
										<span class="text-2xl">✗</span>
										<p class="font-semibold">No emoji found</p>
									</div>
								{/if}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="random">
				<Card.Root>
					<Card.Header>
						<Card.Title>Random Emoji</Card.Title>
						<Card.Description>Get inspired with a random emoji</Card.Description>
					</Card.Header>
					<Card.Content class="text-center">
						<ContextMenu.Root>
							<ContextMenu.Trigger>
								<Button
									onclick={() => copyToClipboard(randomEmoji.emoji, 'Emoji copied to clipboard!')}
									variant="outline"
									size="lg"
									class="relative mb-4 h-40 w-40 overflow-hidden transition-all duration-300 hover:shadow-lg"
								>
									{#key randomEmoji.emoji}
										<div
											in:fly={{ y: 20, duration: 300, delay: 50 }}
											out:fly={{ y: -20, duration: 200 }}
											class="absolute inset-0 flex items-center justify-center"
										>
											<div
												class="transform-gpu text-6xl transition-all duration-300 hover:scale-110 active:scale-95"
											>
												{randomEmoji.emoji}
											</div>
										</div>
									{/key}
								</Button>
							</ContextMenu.Trigger>
							<ContextMenu.Content class="p-2">
								<ContextMenu.Item
									onclick={() => copyToClipboard(randomEmoji.emoji, 'Emoji copied to clipboard!')}
								>
									Copy Emoji
									<ContextMenu.Shortcut class="mx-2">⌘C</ContextMenu.Shortcut>
								</ContextMenu.Item>
								<ContextMenu.Item
									onclick={() =>
										copyToClipboard(randomEmoji.name, 'Emoji name copied to clipboard!')}
								>
									Copy Name
									<ContextMenu.Shortcut class="mx-2">⇧⌘C</ContextMenu.Shortcut>
								</ContextMenu.Item>
								<ContextMenu.Separator />
								<ContextMenu.Item
									onclick={() =>
										copyToClipboard(
											`${randomEmoji.emoji} ${randomEmoji.name}`,
											'Emoji and name copied to clipboard!'
										)}
								>
									Copy Both
									<ContextMenu.Shortcut class="mx-2">⌥⌘C</ContextMenu.Shortcut>
								</ContextMenu.Item>
							</ContextMenu.Content>
						</ContextMenu.Root>

						<div class="space-y-2">
							<Badge variant="secondary" class="text-lg">
								{randomEmoji.name}
							</Badge>
							<div>
								<Button onclick={getRandomEmoji}>
									<span class="mr-2">🎲</span> Get Another
								</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="search">
				<Card.Root>
					<Card.Header>
						<Card.Title>Emoji Search</Card.Title>
						<Card.Description>Find the perfect emoji for your needs</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="mb-4 flex gap-2">
							<Input
								bind:value={searchQuery}
								onkeydown={handleSearchKeyDown}
								placeholder="Search emojis..."
							/>
							<Button onclick={search}>Search</Button>
						</div>
						{#if searchResults.length > 0}
							<div class="flex flex-row flex-wrap gap-4">
								{#each searchResults as result}
									<ContextMenu.Root>
										<ContextMenu.Trigger>
											<Button
												onclick={() => copyToClipboard(result.emoji, `Copied ${result.name}!`)}
												variant="outline"
												class="flex h-auto min-w-32 flex-col p-4 transition-transform hover:scale-105"
											>
												<span class="mb-2 text-3xl">{result.emoji}</span>
												<span class="w-full truncate text-xs text-muted-foreground">
													{result.name}
												</span>
											</Button>
										</ContextMenu.Trigger>
										<ContextMenu.Content class="w-48">
											<ContextMenu.Item
												onclick={() => copyToClipboard(result.emoji, `Copied ${result.name}!`)}
											>
												Copy Emoji
												<ContextMenu.Shortcut class="mx-2">⌘C</ContextMenu.Shortcut>
											</ContextMenu.Item>
											<ContextMenu.Item
												onclick={() => copyToClipboard(result.name, `Copied name: ${result.name}`)}
											>
												Copy Name
												<ContextMenu.Shortcut class="mx-2">⇧⌘C</ContextMenu.Shortcut>
											</ContextMenu.Item>
											<ContextMenu.Separator />
											<ContextMenu.Item
												onclick={() =>
													copyToClipboard(
														`${result.emoji} ${result.name}`,
														'Copied emoji and name!'
													)}
											>
												Copy Both
												<ContextMenu.Shortcut class="mx-2">⌥⌘C</ContextMenu.Shortcut>
											</ContextMenu.Item>
										</ContextMenu.Content>
									</ContextMenu.Root>
								{/each}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</div>
	</Tabs.Root>
</div>
