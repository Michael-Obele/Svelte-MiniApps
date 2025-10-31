import { describe, it, expect } from 'vitest';
import { markdownDemo } from './data.svelte';

describe('Markdown Editor Demo Data', () => {
	describe('markdownDemo', () => {
		it('should be a non-empty string', () => {
			expect(typeof markdownDemo).toBe('string');
			expect(markdownDemo.length).toBeGreaterThan(0);
		});

		it('should contain markdown headers', () => {
			expect(markdownDemo).toMatch(/^# /m);
			expect(markdownDemo).toMatch(/^## /m);
		});

		it('should contain markdown formatting examples', () => {
			expect(markdownDemo).toMatch(/\*\*.*\*\*/); // Bold
			expect(markdownDemo).toMatch(/\*.*\*/); // Italic
			expect(markdownDemo).toMatch(/~~.*~~/); // Strikethrough
		});

		it('should contain links', () => {
			expect(markdownDemo).toMatch(/\[.*\]\(.*\)/);
		});

		it('should contain lists', () => {
			expect(markdownDemo).toMatch(/^\d+\. /m); // Ordered list
			expect(markdownDemo).toMatch(/^-/m); // Unordered list
		});

		it('should contain code blocks', () => {
			expect(markdownDemo).toMatch(/```[\s\S]*?```/);
		});

		it('should contain tables', () => {
			expect(markdownDemo).toMatch(/\|.*\|.*\|/);
		});

		it('should contain images', () => {
			expect(markdownDemo).toMatch(/!\[.*\]\(.*\)/);
		});

		it('should start with a welcome message', () => {
			expect(markdownDemo).toMatch(/^# Welcome to Markdown Magic!/);
		});

		it('should be properly formatted markdown', () => {
			// Check for proper line breaks and structure
			const lines = markdownDemo.split('\n');
			expect(lines.length).toBeGreaterThan(10);

			// Should have some empty lines for separation
			expect(lines.some((line) => line.trim() === '')).toBe(true);
		});
	});
});
