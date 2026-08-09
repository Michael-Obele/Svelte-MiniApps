/**
 * On-device mantra generator.
 *
 * The mantra runs entirely locally — no server RPC, works offline in every
 * environment (web, Capacitor mobile shell, PWA). Both dependencies are
 * browser-compatible:
 *  - `chance` is isomorphic (UMD) — `weighted`/`pickone` are pure math.
 *  - `compromise` is a client-side NLP library designed to run in the browser.
 *
 * Plain `.ts` (not `.svelte.ts`) on purpose: Wuchale's adapters don't scan it,
 * so the word-list strings never leak into the translation catalogs.
 *
 * The module-level dedup list lives on the DEVICE, so hitting reload always
 * yields a fresh mantra — the old server-side list reset between RPC
 * invocations, which is why the reload button used to repeat itself.
 */
import Chance from 'chance';
import nlp from 'compromise';

const ACTION_WORDS = [
	'dance',
	'breathe',
	'explore',
	'embrace',
	'create',
	'dream',
	'grow',
	'shine',
	'flow',
	'spark'
];

// Actions are weighted — same distribution as the original server generator.
const ACTION_WEIGHTS = [15, 10, 15, 15, 10, 10, 10, 10, 10, 10];

const ADJECTIVES = [
	'quirky',
	'radiant',
	'wild',
	'cosmic',
	'vibrant',
	'whimsical',
	'dazzling',
	'playful',
	'bold',
	'serendipitous',
	'zesty',
	'gleeful',
	'luminous',
	'sprightly',
	'effervescent',
	'zany',
	'vivid',
	'sparkling',
	'gleaming',
	'buoyant'
];

const NOUNS = [
	'magic',
	'journey',
	'spark',
	'heart',
	'soul',
	'dream',
	'light',
	'vibe',
	'rhythm',
	'essence',
	'whirl',
	'gleam',
	'spirit',
	'muse',
	'blaze',
	'flair',
	'pulse',
	'whisper',
	'glimmer',
	'zest'
];

const CONCEPTS = [
	'chaos',
	'wonder',
	'bliss',
	'growth',
	'freedom',
	'mystery',
	'gleam',
	'whimsy',
	'sparkle',
	'adventure',
	'serenity',
	'possibility',
	'frolic',
	'radiance',
	'delight',
	'euphoria',
	'marvel',
	'glee',
	'harmony',
	'vitality'
];

const TEMPLATES = [
	'{action} your {adj} {noun}',
	'{action} the {adj} {noun}',
	'{action} with {adj} {concept}',
	'{action} in {adj} {concept}',
	'{action} your {noun} with {concept}',
	'{action} a {adj} {noun}',
	'{action} {adj} {concept} daily',
	'{action} your {concept} with {noun}',
	'{action} through {adj} {noun}',
	'{action} the {concept} within',
	'{action} with {noun} and {concept}',
	'{action} a {noun} of {concept}'
];

const TEMPLATE_WEIGHTS = [15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

// Recent mantras on this device — keeps reloads fresh without the server's
// per-invocation dedup that reset between requests.
const recentMantras: string[] = [];

/**
 * Replaces "the X" with "a/an X" using compromise, like the original server
 * generator. The matched phrase is "the X", but `.nouns().text()` /
 * `.adjectives().text()` can include the determiner itself ("the radiance"),
 * which would yield "a the radiance". Taking the last word of the match gets
 * the bare X regardless of how compromise tags the phrase.
 */
function fixArticles(mantra: string): string {
	const doc = nlp(mantra);

	doc.match('the #Adjective').forEach((match: any) => {
		const words = match.text().split(/\s+/);
		const adjective = words[words.length - 1];
		if (adjective && adjective !== 'the') {
			const article = 'aeiou'.includes(adjective[0].toLowerCase()) ? 'an' : 'a';
			match.replaceWith(`${article} ${adjective}`);
		}
	});

	doc.match('the #Noun').forEach((match: any) => {
		const words = match.text().split(/\s+/);
		const noun = words[words.length - 1];
		if (noun && noun !== 'the') {
			const article = 'aeiou'.includes(noun[0].toLowerCase()) ? 'an' : 'a';
			match.replaceWith(`${article} ${noun}`);
		}
	});

	return doc.text();
}

function finalize(mantra: string): string {
	const normalized = mantra.replace(/\s+/g, ' ').trim();
	return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/** Builds one mantra from the word lists, then fixes articles and case. */
function buildMantra(chance: Chance.Chance): string {
	const template = chance.weighted(TEMPLATES, TEMPLATE_WEIGHTS);
	const action = chance.weighted(ACTION_WORDS, ACTION_WEIGHTS);
	const adj = chance.pickone(ADJECTIVES);
	const noun = chance.pickone(NOUNS);
	const concept = chance.pickone(CONCEPTS);

	return finalize(
		fixArticles(
			template
				.replace('{action}', action)
				.replace('{adj}', adj)
				.replace('{noun}', noun)
				.replace('{concept}', concept)
		)
	);
}

/**
 * Returns a fresh, unique mantra. Same 4–6 word constraint and fallback
 * construction as the original server generator, but dedup is per-device.
 */
export function generateLocalMantra(): string {
	const chance = new Chance();
	const maxAttempts = 12;
	let candidate = buildMantra(chance);

	let attempt = 0;
	while (
		attempt < maxAttempts &&
		(candidate.split(/\s+/).length < 4 ||
			candidate.split(/\s+/).length > 6 ||
			recentMantras.includes(candidate))
	) {
		candidate = buildMantra(chance);
		attempt++;
	}

	// Guaranteed 4-word construction after retries.
	if (
		candidate.split(/\s+/).length < 4 ||
		candidate.split(/\s+/).length > 6 ||
		recentMantras.includes(candidate)
	) {
		candidate = finalize(
			`${chance.pickone(ACTION_WORDS)} ${chance.pickone(ADJECTIVES)} ${chance.pickone(NOUNS)} ${chance.pickone(CONCEPTS)}`
		);
		if (recentMantras.includes(candidate)) {
			candidate = `${candidate} now`;
		}
	}

	recentMantras.push(candidate);
	if (recentMantras.length > 10) recentMantras.shift();

	return candidate;
}
