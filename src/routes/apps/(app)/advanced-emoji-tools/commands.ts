import * as emoji from 'node-emoji';

export function emojify(input: string): string {
	// Set input text
	let inputText = input;

	// First unemojify to convert any existing emojis to shortcodes
	const withShortcodes = emoji.unemojify(inputText);
	const textWithShortcodes = withShortcodes.replace(/:([\w-]+):/g, '$1');
	// Then convert the text to proper emoji format
	const formatted = convertToEmojiFormat(textWithShortcodes);
	// Finally emojify everything
	let outputText = emoji.emojify(formatted);

	return outputText;
}

export function unemojify(input: string): string {
	let inputText = input;
	// First convert emojis to shortcodes
	const withColons = emoji.unemojify(inputText);
	// Then remove the colons from the shortcodes
	let outputText = withColons.replace(/:([\w-]+):/g, '$1');

	return outputText;
}

export function strip(input: string): string {
	let inputText = input;
	let outputText = emoji.strip(inputText);
	return outputText;
}

export function stripText(input: string): string {
	let inputText = input;
	if (!inputText) {
		let outputText = '';
		return outputText;
	}
	// First convert any emojis to shortcode format
	const withShortcodes = emoji.unemojify(inputText);
	// Extract only the emoji shortcodes and convert them back to emoji
	const matches = withShortcodes.match(/:\w+:/g) || [];
	const emojis = matches.map((match) => emoji.emojify(match));
	let outputText = emojis.join(' ');

	return outputText;
}

export function search(query: string): { emoji: string; name: string }[] {
	let searchQuery = query;
	let searchResults = emoji.search(searchQuery);
	return searchResults;
}

export function getRandomEmoji(): { emoji: string; name: string } {
	let randomEmoji = emoji.random();
	return randomEmoji;
}

export function findEmoji(input: string): { emoji: string; key: string } | undefined {
	return emoji.find(input);
}

export function hasEmoji(input: string): boolean {
	return emoji.has(input);
}

export function convertToEmojiFormat(text: string): string {
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
