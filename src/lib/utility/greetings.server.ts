import Chance from 'chance';
import nlp from 'compromise';

/**
 * Server-only mantra generation utilities (uses Node.js dependencies)
 * Import this file only in .server.ts files
 */

// Track recent mantras to avoid duplicates
const recentMantras: string[] = [];

/**
 * Generates a random, quirky, and uplifting mantra.
 *
 * @returns A randomly generated mantra, capitalized and formatted. Falls back to a predefined list
 * if a generated mantra doesn't meet the 4-6 word requirement or is a recent duplicate.
 */
export function generateMantra(): string {
	const chance = new Chance();

	const actionWords = [
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

	const adjectives = [
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

	const nouns = [
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

	const concepts = [
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

	const templates = [
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

	const template = chance.weighted(templates, [15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
	const action = chance.weighted(actionWords, [15, 10, 15, 15, 10, 10, 10, 10, 10, 10]);

	const adj = chance.weighted(adjectives, Array(adjectives.length).fill(1));
	const noun = chance.weighted(nouns, Array(nouns.length).fill(1));
	const concept = chance.weighted(concepts, Array(concepts.length).fill(1));

	let mantra = template
		.replace('{action}', action)
		.replace('{adj}', adj)
		.replace('{noun}', noun)
		.replace('{concept}', concept || '');

	// Replace "the <adj>" with correct indefinite article (a/an) using compromise NLP
	const doc = nlp(mantra);

	// Find patterns where "the" precedes words that should have indefinite articles
	doc.match('the #Adjective').forEach((match: any) => {
		const adjective = match.adjectives().text();
		if (adjective) {
			const article = 'aeiou'.includes(adjective[0].toLowerCase()) ? 'an' : 'a';
			match.replaceWith(`${article} ${adjective}`);
		}
	});

	// Also handle "the <noun>" patterns for better grammar
	doc.match('the #Noun').forEach((match: any) => {
		const noun = match.nouns().text();
		if (noun) {
			const article = 'aeiou'.includes(noun[0].toLowerCase()) ? 'an' : 'a';
			match.replaceWith(`${article} ${noun}`);
		}
	});

	mantra = doc.text();

	// Normalize spacing and capitalization
	mantra = mantra.replace(/\s+/g, ' ').trim();
	mantra = mantra.charAt(0).toUpperCase() + mantra.slice(1);

	// Try multiple times to generate a valid, unique mantra
	const maxAttempts = 12;
	let attempt = 0;
	let candidate = mantra;

	while (
		attempt < maxAttempts &&
		(candidate.split(/\s+/).length < 4 ||
			candidate.split(/\s+/).length > 6 ||
			recentMantras.includes(candidate))
	) {
		const templateTry = chance.weighted(
			templates,
			[15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
		);
		const actionTry = chance.weighted(actionWords, [15, 10, 15, 15, 10, 10, 10, 10, 10, 10]);
		const adjTry = chance.pickone(adjectives);
		const nounTry = chance.pickone(nouns);
		const conceptTry = chance.pickone(concepts);
		candidate = templateTry
			.replace('{action}', actionTry)
			.replace('{adj}', adjTry)
			.replace('{noun}', nounTry)
			.replace('{concept}', conceptTry || '');

		// Use compromise for better article correction
		const docTry = nlp(candidate);
		docTry.match('the #Adjective').forEach((match: any) => {
			const adjective = match.adjectives().text();
			if (adjective) {
				const article = 'aeiou'.includes(adjective[0].toLowerCase()) ? 'an' : 'a';
				match.replaceWith(`${article} ${adjective}`);
			}
		});
		docTry.match('the #Noun').forEach((match: any) => {
			const noun = match.nouns().text();
			if (noun) {
				const article = 'aeiou'.includes(noun[0].toLowerCase()) ? 'an' : 'a';
				match.replaceWith(`${article} ${noun}`);
			}
		});

		candidate = docTry.text().replace(/\s+/g, ' ').trim();
		candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);
		attempt++;
	}

	// If after retries we still don't have a valid unique mantra, construct a guaranteed 4-word mantra
	if (
		candidate.split(/\s+/).length < 4 ||
		candidate.split(/\s+/).length > 6 ||
		recentMantras.includes(candidate)
	) {
		candidate = `${chance.pickone(actionWords)} ${chance.pickone(adjectives)} ${chance.pickone(nouns)} ${chance.pickone(concepts)}`;
		candidate = candidate.replace(/\s+/g, ' ').trim();
		candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);
		// ensure uniqueness by slightly varying if needed
		if (recentMantras.includes(candidate)) {
			candidate = `${candidate} now`;
		}
	}

	recentMantras.push(candidate);
	if (recentMantras.length > 10) recentMantras.shift();

	return candidate;
}
