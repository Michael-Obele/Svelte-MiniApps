import { describe, it, expect } from 'vitest';
import { resolveShareTarget, resolveProtocolTarget } from './share-routing';

describe('resolveShareTarget', () => {
	it('routes an explicit URL to the QR generator', () => {
		expect(resolveShareTarget({ url: 'https://example.com/article' })).toBe(
			'/apps/qr-code-generator?url=' + encodeURIComponent('https://example.com/article')
		);
	});

	it('extracts a URL embedded in shared text', () => {
		expect(resolveShareTarget({ text: 'Great read https://example.com/post' })).toContain(
			'/apps/qr-code-generator'
		);
	});

	it('ignores non-http schemes', () => {
		expect(resolveShareTarget({ text: 'javascript:alert(1)' })).not.toContain('qr-code-generator');
	});

	it('routes a currency amount to the currency converter', () => {
		expect(resolveShareTarget({ text: '25 USD' })).toContain('/apps/currency-converter');
		expect(resolveShareTarget({ text: '$25' })).toContain('/apps/currency-converter');
		expect(resolveShareTarget({ text: 'EUR 40' })).toContain('/apps/currency-converter');
	});

	it('routes a unit amount to the unit converter', () => {
		expect(resolveShareTarget({ text: '12 kg' })).toContain('/apps/unit-converter');
		expect(resolveShareTarget({ text: '30cm' })).toContain('/apps/unit-converter');
	});

	it('routes long text to the summarizer', () => {
		expect(resolveShareTarget({ text: 'word '.repeat(120) })).toContain('/apps/text-summarizer');
	});

	it('routes ordinary short text to flash-text', () => {
		expect(resolveShareTarget({ text: 'remember the milk' })).toContain('/apps/flash-text');
	});

	it('does not mistake prose mentioning a price for a conversion', () => {
		expect(resolveShareTarget({ text: 'it cost me 25 USD yesterday' })).toContain('/apps/flash-text');
	});

	it('falls back to the apps index when nothing usable is shared', () => {
		expect(resolveShareTarget({})).toBe('/apps');
		expect(resolveShareTarget({ text: '   ' })).toBe('/apps');
	});

	it('falls back to the title when text is absent', () => {
		expect(resolveShareTarget({ title: 'a note' })).toContain('/apps/flash-text');
	});
});

describe('resolveProtocolTarget', () => {
	const slugs = ['budget-tracker', 'flash-text'];

	it('rejects a foreign scheme', () => {
		expect(resolveProtocolTarget('https://evil.example.com')).toBeNull();
		expect(resolveProtocolTarget('web+other://budget-tracker')).toBeNull();
	});

	it('rejects empty input', () => {
		expect(resolveProtocolTarget('')).toBeNull();
		expect(resolveProtocolTarget(null)).toBeNull();
	});

	it('routes a known app slug straight to that app', () => {
		expect(resolveProtocolTarget('web+miniapps://budget-tracker', slugs)).toBe(
			'/apps/budget-tracker'
		);
	});

	it('does not route an unknown slug to a 404', () => {
		expect(resolveProtocolTarget('web+miniapps://not-a-real-app', slugs)).not.toBe(
			'/apps/not-a-real-app'
		);
	});

	it('falls back to share heuristics for a free-text payload', () => {
		expect(resolveProtocolTarget('web+miniapps://hello%20world', slugs)).toContain(
			'/apps/flash-text'
		);
	});
});
