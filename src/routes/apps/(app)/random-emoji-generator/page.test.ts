import { describe, it, expect } from 'vitest';
import * as emoji from 'node-emoji';

describe('Random Emoji Generator', () => {
	describe('emoji.random', () => {
		it('should return an object with emoji and name', () => {
			const result = emoji.random();
			expect(result).toHaveProperty('emoji');
			expect(result).toHaveProperty('name');
			expect(typeof result.emoji).toBe('string');
			expect(typeof result.name).toBe('string');
			expect(result.emoji.length).toBeGreaterThan(0);
			expect(result.name.length).toBeGreaterThan(0);
		});

		it('should return different emojis on multiple calls', () => {
			const result1 = emoji.random();
			const result2 = emoji.random();
			// Note: This could theoretically fail if the same emoji is returned twice,
			// but with many emojis, it's unlikely
			expect(result1.emoji).not.toBe(result2.emoji);
		});
	});
});
