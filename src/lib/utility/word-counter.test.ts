import { describe, it, expect } from 'vitest';
import { analyzeText, formatDuration } from './word-counter';

describe('analyzeText', () => {
	it('returns zeroed counts for empty or whitespace-only text', () => {
		for (const input of ['', '   ', '\n\n\t']) {
			const stats = analyzeText(input);
			expect(stats.words).toBe(0);
			expect(stats.characters).toBe(input.length);
			expect(stats.charactersNoSpaces).toBe(0);
			expect(stats.sentences).toBe(0);
			expect(stats.paragraphs).toBe(0);
			expect(stats.keywords).toEqual([]);
		}
	});

	it('counts words, sentences, and unique words', () => {
		const stats = analyzeText('Hello world. This is a test!');
		expect(stats.words).toBe(6);
		expect(stats.sentences).toBe(2);
		expect(stats.uniqueWords).toBe(6);
		expect(stats.paragraphs).toBe(1);
		expect(stats.lines).toBe(1);
	});

	it('treats contractions and hyphenated compounds as single words', () => {
		const stats = analyzeText("Don't stop—state-of-the-art code.");
		expect(stats.words).toBe(4);
	});

	it('counts characters, including multi-code-unit characters, without spaces', () => {
		const stats = analyzeText('a b\nc');
		expect(stats.characters).toBe(5);
		expect(stats.charactersNoSpaces).toBe(3);
		expect(analyzeText('😀').characters).toBe(1);
	});

	it('counts paragraphs separated by blank lines and physical lines', () => {
		const stats = analyzeText('One\n\nTwo\nThree');
		expect(stats.paragraphs).toBe(2);
		expect(stats.lines).toBe(4);
	});

	it('does not treat decimals as sentence endings', () => {
		expect(analyzeText('3.14 is pi. Done.').sentences).toBe(2);
		expect(analyzeText('Hello there').sentences).toBe(1);
		expect(analyzeText('Wait...').sentences).toBe(1);
	});

	it('ranks keywords by frequency, excluding stop words and numbers', () => {
		const stats = analyzeText('The quick brown fox. The quick fox.', 3);
		expect(stats.keywords.map((keyword) => keyword.word)).toEqual(['fox', 'quick', 'brown']);
		expect(stats.keywords[0].count).toBe(2);
		expect(stats.keywords[0].density).toBeCloseTo((2 / 7) * 100);
	});

	it('honours the keyword limit and returns nothing for stop-word-only text', () => {
		expect(analyzeText('alpha alpha beta beta gamma gamma delta', 2).keywords).toHaveLength(2);
		expect(analyzeText('the and of').keywords).toEqual([]);
	});

	it('estimates reading and speaking time', () => {
		const stats = analyzeText('word '.repeat(201).trim());
		expect(stats.readingMinutes).toBe(2);
		expect(stats.speakingMinutes).toBe(2);
		expect(analyzeText('word '.repeat(200).trim()).readingMinutes).toBe(1);
	});
});

describe('formatDuration', () => {
	it('formats minutes and hours', () => {
		expect(formatDuration(0)).toBe('—');
		expect(formatDuration(1)).toBe('1 min');
		expect(formatDuration(90)).toBe('1h 30m');
		expect(formatDuration(120)).toBe('2h');
	});
});
