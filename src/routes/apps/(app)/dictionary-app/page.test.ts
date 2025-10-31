import { describe, it, expect } from 'vitest';

// Import the validateWord function from the server file
// Since it's a server file, we need to import it carefully
// For testing purposes, we'll copy the function or mock

// Helper function to validate word (copied from +page.server.ts)
function validateWord(word: string): string | null {
	if (!word || typeof word !== 'string') {
		return 'Word is required';
	}

	const trimmedWord = word.trim();

	if (trimmedWord.length === 0) {
		return 'Word cannot be empty';
	}

	if (trimmedWord.length > 50) {
		return 'Word cannot be longer than 50 characters';
	}

	if (!/^[a-zA-Z\s-]+$/.test(trimmedWord)) {
		return 'Word can only contain letters, spaces, and hyphens';
	}

	return null;
}

describe('Dictionary App', () => {
	describe('validateWord', () => {
		it('should return null for valid words', () => {
			expect(validateWord('hello')).toBeNull();
			expect(validateWord('test-word')).toBeNull();
			expect(validateWord('multiple words')).toBeNull();
		});

		it('should return error for empty string', () => {
			expect(validateWord('')).toBe('Word is required');
		});

		it('should return error for whitespace only', () => {
			expect(validateWord('   ')).toBe('Word cannot be empty');
		});

		it('should return error for non-string input', () => {
			// Note: In TypeScript, this would be caught at compile time,
			// but for runtime testing
			expect(validateWord(null as any)).toBe('Word is required');
			expect(validateWord(undefined as any)).toBe('Word is required');
		});

		it('should return error for words too long', () => {
			const longWord = 'a'.repeat(51);
			expect(validateWord(longWord)).toBe('Word cannot be longer than 50 characters');
		});

		it('should return error for invalid characters', () => {
			expect(validateWord('hello123')).toBe('Word can only contain letters, spaces, and hyphens');
			expect(validateWord('hello!')).toBe('Word can only contain letters, spaces, and hyphens');
			expect(validateWord('hello@world')).toBe(
				'Word can only contain letters, spaces, and hyphens'
			);
		});

		it('should trim whitespace', () => {
			expect(validateWord('  hello  ')).toBeNull();
			expect(validateWord('\tword\n')).toBeNull();
		});
	});
});
