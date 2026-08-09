import { describe, it, expect } from 'vitest';
import { generateLocalMantra } from './mantra.client';

describe('generateLocalMantra (on-device, browser-compatible)', () => {
	it('returns a capitalized mantra', () => {
		const mantra = generateLocalMantra();
		expect(mantra.charAt(0)).toBe(mantra.charAt(0).toUpperCase());
	});

	it('returns 4–6 words', () => {
		for (let i = 0; i < 25; i++) {
			const words = generateLocalMantra().split(/\s+/).length;
			expect(words).toBeGreaterThanOrEqual(4);
			expect(words).toBeLessThanOrEqual(6);
		}
	});

	it('never repeats within a session (module-level dedup)', () => {
		const seen = new Set<string>();
		for (let i = 0; i < 10; i++) {
			const mantra = generateLocalMantra();
			expect(seen.has(mantra)).toBe(false);
			seen.add(mantra);
		}
	});

	it('never contains the placeholder tokens', () => {
		for (let i = 0; i < 25; i++) {
			const mantra = generateLocalMantra();
			expect(mantra).not.toMatch(/\{(action|adj|noun|concept)\}/);
		}
	});

	it('produces grammatically fixed articles (no "the" before nouns)', () => {
		// "the" only survives in "within"-style templates where it is correct;
		// it must never precede a plain noun/adjective picked from our lists.
		for (let i = 0; i < 25; i++) {
			const mantra = generateLocalMantra();
			const theMatch = mantra.match(/\bthe ([a-z]+)/);
			if (theMatch) {
				// Only acceptable when "the" heads "the ... within" template.
				expect(mantra.endsWith(' within')).toBe(true);
			}
		}
	});
});
