import { describe, it, expect } from 'vitest';
import {
	emojify,
	unemojify,
	strip,
	stripText,
	search,
	getRandomEmoji,
	findEmoji,
	hasEmoji,
	convertToEmojiFormat
} from './commands';

describe('Advanced Emoji Tools', () => {
	describe('emojify', () => {
		it('should convert text with emoji keywords to emojis', () => {
			expect(emojify('I love heart')).toBe('I love ❤️');
			expect(emojify('smile and thumbsup')).toBe('😄 and thumbsup');
		});

		it('should handle mixed text and existing emojis', () => {
			expect(emojify('I ❤️ pizza')).toBe('I ❤️ 🍕');
		});

		it('should leave non-emoji words unchanged', () => {
			expect(emojify('hello world')).toBe('hello world');
		});

		it('should handle punctuation', () => {
			expect(emojify('heart!')).toBe('❤️!');
		});
	});

	describe('unemojify', () => {
		it('should convert emojis to shortcodes', () => {
			expect(unemojify('I ❤️ pizza')).toBe('I heart pizza');
		});

		it('should handle multiple emojis', () => {
			expect(unemojify('😄 👍')).toBe('smile :+1:');
		});

		it('should leave text without emojis unchanged', () => {
			expect(unemojify('hello world')).toBe('hello world');
		});
	});

	describe('strip', () => {
		it('should remove all emojis from text', () => {
			expect(strip('I ❤️ pizza 🍕')).toBe('I pizza ');
		});

		it('should handle text without emojis', () => {
			expect(strip('hello world')).toBe('hello world');
		});
	});

	describe('stripText', () => {
		it('should extract only emojis from text', () => {
			expect(stripText('I ❤️ pizza 🍕 and coffee')).toBe('❤️ 🍕');
		});

		it('should return empty string for text without emojis', () => {
			expect(stripText('hello world')).toBe('');
		});

		it('should handle empty input', () => {
			expect(stripText('')).toBe('');
		});
	});

	describe('search', () => {
		it('should return array of emoji results for valid query', () => {
			const results = search('heart');
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);
			results.forEach((result) => {
				expect(result).toHaveProperty('emoji');
				expect(result).toHaveProperty('name');
			});
		});

		it('should return empty array for invalid query', () => {
			const results = search('nonexistentemoji123');
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBe(0);
		});
	});

	describe('getRandomEmoji', () => {
		it('should return an object with emoji and name', () => {
			const result = getRandomEmoji();
			expect(result).toHaveProperty('emoji');
			expect(result).toHaveProperty('name');
			expect(typeof result.emoji).toBe('string');
			expect(typeof result.name).toBe('string');
			expect(result.emoji.length).toBeGreaterThan(0);
			expect(result.name.length).toBeGreaterThan(0);
		});
	});

	describe('findEmoji', () => {
		it('should find emoji by name', () => {
			const result = findEmoji('heart');
			expect(result).toHaveProperty('emoji');
			expect(result).toHaveProperty('key');
			expect(result?.emoji).toBe('❤️');
			expect(result?.key).toBe('heart');
		});

		it('should return undefined for non-existent emoji', () => {
			const result = findEmoji('nonexistent');
			expect(result).toBeUndefined();
		});
	});

	describe('hasEmoji', () => {
		it('should return true for existing emoji', () => {
			expect(hasEmoji('heart')).toBe(true);
			expect(hasEmoji('smile')).toBe(true);
		});

		it('should return false for non-existent emoji', () => {
			expect(hasEmoji('nonexistent')).toBe(false);
		});
	});

	describe('convertToEmojiFormat', () => {
		it('should wrap emoji words in colons', () => {
			expect(convertToEmojiFormat('I love heart')).toBe('I love :heart:');
		});

		it('should handle punctuation', () => {
			expect(convertToEmojiFormat('heart!')).toBe(':heart:!');
		});

		it('should leave non-emoji words unchanged', () => {
			expect(convertToEmojiFormat('hello world')).toBe('hello world');
		});

		it('should handle multiple words', () => {
			expect(convertToEmojiFormat('heart smile pizza')).toBe(':heart: :smile: :pizza:');
		});
	});
});
