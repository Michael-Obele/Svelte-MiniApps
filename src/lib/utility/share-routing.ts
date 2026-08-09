/**
 * Share-target routing.
 *
 * Maps content shared into the installed PWA (Web Share Target API) onto the
 * mini-app best suited to handle it. Kept free of SvelteKit imports so it can
 * be unit-tested directly.
 */

export interface SharePayload {
	title?: string | null;
	text?: string | null;
	url?: string | null;
}

/** Text at or beyond this length is worth summarising rather than pasting. */
const SUMMARIZE_THRESHOLD = 400;

/**
 * ISO-4217 codes we recognise in shared text. Deliberately a small, common
 * subset — a false negative just routes to flash-text, which is harmless,
 * whereas matching every three-letter word would hijack ordinary sentences.
 */
const CURRENCY_CODES = new Set([
	'usd', 'eur', 'gbp', 'jpy', 'cny', 'inr', 'ngn', 'cad', 'aud', 'chf',
	'zar', 'brl', 'mxn', 'sek', 'nok', 'dkk', 'pln', 'rub', 'krw', 'sgd',
	'nzd', 'hkd', 'try', 'aed', 'sar', 'kes', 'ghs', 'egp'
]);

/** Currency symbols that can prefix an amount, e.g. "$25". */
const CURRENCY_SYMBOLS = ['$', '€', '£', '¥', '₹', '₦', '₩'];

/**
 * Unit tokens the unit-converter handles. Matched case-insensitively against
 * a trailing token, so "12 kg" hits but "12 kilograms of flour" does not —
 * the latter is prose and belongs in flash-text.
 */
const UNIT_TOKENS = new Set([
	// length
	'mm', 'cm', 'm', 'km', 'in', 'inch', 'inches', 'ft', 'foot', 'feet', 'yd', 'mi', 'mile', 'miles',
	// mass
	'mg', 'g', 'kg', 'lb', 'lbs', 'oz', 'ton', 'tonne',
	// temperature
	'c', 'f', 'k', 'celsius', 'fahrenheit', 'kelvin',
	// volume
	'ml', 'l', 'litre', 'liter', 'litres', 'liters', 'gal', 'gallon', 'pt', 'qt',
	// digital
	'kb', 'mb', 'gb', 'tb'
]);

function firstNonEmpty(...values: Array<string | null | undefined>): string {
	for (const value of values) {
		const trimmed = value?.trim();
		if (trimmed) return trimmed;
	}
	return '';
}

/**
 * Extracts an http(s) URL from a string. Android often shares a title and a
 * URL concatenated into `text` rather than populating `url`, so we scan.
 */
function extractUrl(value: string): string | null {
	if (!value) return null;

	const match = value.match(/https?:\/\/[^\s<>"']+/i);
	if (!match) return null;

	try {
		const parsed = new URL(match[0]);
		// Guard against javascript:/data: sneaking through a crafted string.
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
		return parsed.toString();
	} catch {
		return null;
	}
}

/**
 * Detects "<amount> <currency>" or "<symbol><amount>" shares.
 * Returns true only when the whole string is the amount — a sentence that
 * merely mentions a price is prose, not a conversion request.
 */
function isCurrencyAmount(value: string): boolean {
	const normalized = value.trim().toLowerCase();

	for (const symbol of CURRENCY_SYMBOLS) {
		if (normalized.startsWith(symbol) && /^[\d.,]+$/.test(normalized.slice(symbol.length).trim())) {
			return true;
		}
	}

	const match = normalized.match(/^([\d.,]+)\s*([a-z]{3})$/);
	if (match) return CURRENCY_CODES.has(match[2]);

	// "usd 25" ordering
	const reversed = normalized.match(/^([a-z]{3})\s*([\d.,]+)$/);
	if (reversed) return CURRENCY_CODES.has(reversed[1]);

	return false;
}

/** Detects "<amount> <unit>", e.g. "12 kg", "30cm", "98.6 F". */
function isUnitAmount(value: string): boolean {
	const match = value.trim().toLowerCase().match(/^([\d.,]+)\s*([a-z]+)$/);
	if (!match) return false;
	return UNIT_TOKENS.has(match[2]);
}

/**
 * Chooses the mini-app that should receive shared content.
 *
 * @returns A root-relative path, always safe to pass to `redirect()`.
 */
export function resolveShareTarget(payload: SharePayload): string {
	const url = firstNonEmpty(payload.url);
	const text = firstNonEmpty(payload.text);
	const title = firstNonEmpty(payload.title);

	// An explicit URL param, or a URL embedded in the shared text.
	const sharedUrl = extractUrl(url) ?? extractUrl(text);
	if (sharedUrl) {
		return `/apps/qr-code-generator?url=${encodeURIComponent(sharedUrl)}`;
	}

	const body = firstNonEmpty(text, title);
	if (!body) return '/apps';

	if (isCurrencyAmount(body)) {
		return `/apps/currency-converter?amount=${encodeURIComponent(body)}`;
	}

	if (isUnitAmount(body)) {
		return `/apps/unit-converter?value=${encodeURIComponent(body)}`;
	}

	if (body.length >= SUMMARIZE_THRESHOLD) {
		return `/apps/text-summarizer?text=${encodeURIComponent(body)}`;
	}

	return `/apps/flash-text?content=${encodeURIComponent(body)}`;
}

/**
 * Resolves a `web+miniapps://` protocol-handler payload.
 *
 * The manifest registers `web+miniapps` and forwards the whole URL as the
 * `url` query param. We only accept that scheme; anything else returns null
 * so the caller can refuse rather than redirect somewhere attacker-chosen.
 *
 * @param knownSlugs Slugs of apps that actually exist. Required to route a
 * payload straight to an app — without it an arbitrary payload would happily
 * resolve to `/apps/<anything>` and 404. Omit it and payloads fall through to
 * the normal share heuristics instead.
 */
export function resolveProtocolTarget(
	rawUrl: string | null | undefined,
	knownSlugs?: Iterable<string>
): string | null {
	const value = rawUrl?.trim();
	if (!value) return null;

	// Case-insensitive per RFC 3986; browsers may normalise, we should not assume.
	if (!/^web\+miniapps:/i.test(value)) return null;

	// Strip the scheme (and any authority slashes) to get the payload.
	const payload = value.replace(/^web\+miniapps:(\/\/)?/i, '');
	if (!payload) return '/apps';

	let decoded: string;
	try {
		decoded = decodeURIComponent(payload);
	} catch {
		decoded = payload;
	}

	// A payload naming a real app routes straight there, e.g.
	// web+miniapps://budget-tracker
	if (knownSlugs) {
		const slug = decoded.split(/[/?#]/)[0].toLowerCase();
		const allowed = knownSlugs instanceof Set ? knownSlugs : new Set(knownSlugs);
		if (allowed.has(slug)) {
			return `/apps/${slug}`;
		}
	}

	return resolveShareTarget({ text: decoded });
}
