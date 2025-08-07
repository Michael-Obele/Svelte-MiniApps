export interface Mantra {
	phrase: string;
}

/**
 * An array of 100 unique mantras.
 * @type {Mantra[]}
 */
export const mantras: Mantra[] = [
	{ phrase: 'Practice kindness every day' },
	{ phrase: 'Embrace change with open arms' },
	{ phrase: 'Choose joy in every moment' },
	{ phrase: 'Spread positivity wherever you go' },
	{ phrase: 'Create magic in the ordinary' },
	{ phrase: 'Share knowledge to empower others' },
	{ phrase: 'Build community through connection' },
	{ phrase: 'Foster growth in yourself and others' },
	{ phrase: 'Inspire others to dream bigger' },
	{ phrase: 'Cultivate peace in your heart' },
	{ phrase: 'Nurture creativity in all forms' },
	{ phrase: 'Spark innovation through curiosity' },
	{ phrase: 'Radiate love and compassion' },
	{ phrase: 'Chase dreams with determination' },
	{ phrase: 'Celebrate progress, no matter how small' },
	{ phrase: 'Discover possibilities in challenges' },
	{ phrase: 'Ignite passion in everything you do' },
	{ phrase: 'Embrace challenges as opportunities' },
	{ phrase: 'Unlock potential through persistence' },
	{ phrase: 'Spread happiness like confetti' },
	{ phrase: 'Create memories that last forever' },
	{ phrase: 'Find balance in the chaos' },
	{ phrase: 'Trust yourself to make good choices' },
	{ phrase: 'Explore opportunities with courage' },
	{ phrase: 'Share stories that inspire change' },
	{ phrase: 'Build connections that matter' },
	{ phrase: 'Dream big and dare to fail' },
	{ phrase: 'Stay curious about everything' },
	{ phrase: 'Keep learning something new everyday' },
	{ phrase: 'Make impact in your community' },
	{ phrase: 'Be authentic in your journey' },
	{ phrase: 'Lead change with compassion' },
	{ phrase: 'Seek wisdom in simple moments' },
	{ phrase: 'Cherish moments with loved ones' },
	{ phrase: 'Inspire greatness in others' },
	{ phrase: 'Foster understanding through empathy' },
	{ phrase: 'Create harmony in diversity' },
	{ phrase: 'Turn obstacles into stepping stones' },
	{ phrase: 'Find strength in vulnerability' },
	{ phrase: 'Embrace the journey, not just the destination' },
	{ phrase: 'Light the way for others' },
	{ phrase: 'Dance in the rain of life' },
	{ phrase: 'Plant seeds of kindness everywhere' },
	{ phrase: 'Write your story with courage' },
	{ phrase: 'Paint your world with possibility' },
	{ phrase: 'Create a world where love and peace unite' },
	{ phrase: 'Embrace the beauty of everyday life' },
	{ phrase: 'Connect with others in a simple way' },
	{ phrase: 'Create a world where kindness is the norm' },
	{ phrase: 'Be kind to yourself and others' },
	// Additional mantras to reach 100 items
	{ phrase: 'Embrace the wonder of everyday moments' },
	{ phrase: 'Believe in your limitless potential' },
	{ phrase: 'Grow through every challenge' },
	{ phrase: "Savor the beauty of life's details" },
	{ phrase: 'Transform obstacles into opportunities' },
	{ phrase: 'Nourish your soul with gratitude' },
	{ phrase: 'Find joy in the simplest things' },
	{ phrase: 'Let your heart be your compass' },
	{ phrase: 'Celebrate your unique journey' },
	{ phrase: 'Discover strength in every setback' },
	{ phrase: 'Cultivate wisdom from experience' },
	{ phrase: 'Empower yourself with positive thoughts' },
	{ phrase: 'Radiate confidence and inner peace' },
	{ phrase: 'Dare to be your authentic self' },
	{ phrase: 'Trust the magic of new beginnings' },
	{ phrase: 'Unleash creativity with every breath' },
	{ phrase: 'Embody resilience in every step' },
	{ phrase: 'Find serenity in the chaos' },
	{ phrase: 'Let hope guide you through darkness' },
	{ phrase: 'Cherish the lessons of each day' },
	{ phrase: 'Awaken your spirit to endless possibilities' },
	{ phrase: 'Inspire change with your unique voice' },
	{ phrase: 'Live boldly, love freely' },
	{ phrase: 'Share your light with the world' },
	{ phrase: 'Transform dreams into reality' },
	{ phrase: 'Step into greatness with courage' },
	{ phrase: 'Embrace the rhythm of life' },
	{ phrase: 'Harness the power of your dreams' },
	{ phrase: 'Ignite your passion with purpose' },
	{ phrase: 'Cherish every heartbeat of life' },
	{ phrase: 'Align with the energy of the universe' },
	{ phrase: 'Empower your mind with positivity' },
	{ phrase: 'Let your vision lead the way' },
	{ phrase: "Stay open to life's surprises" },
	{ phrase: 'Flourish in the garden of possibility' },
	{ phrase: 'Celebrate the art of being present' },
	{ phrase: 'Uncover beauty in every moment' },
	{ phrase: 'Let your spirit soar with joy' },
	{ phrase: 'Balance ambition with gratitude' },
	{ phrase: 'Keep your dreams alive and vibrant' },
	{ phrase: 'Embrace the flow of new experiences' },
	{ phrase: 'Cherish the strength of your journey' },
	{ phrase: 'Find clarity in moments of stillness' },
	{ phrase: 'Be a beacon of hope and kindness' },
	{ phrase: 'Step forward with unwavering faith' },
	{ phrase: 'Live with passion, inspire with purpose' },
	{ phrase: 'Harness the power of inner strength' },
	{ phrase: 'Celebrate life’s small victories' },
	{ phrase: 'Let positivity shape your future' },
	{ phrase: 'Cultivate dreams with persistent action' },
	{ phrase: 'Honor the journey, not just the destination' },
	{ phrase: 'Elevate your spirit with every step' },
	{ phrase: 'Bask in the glow of your achievements' },
	{ phrase: 'Embrace uncertainty with open arms' },
	{ phrase: 'Let resilience be your guiding force' }
];

/**
 * Returns a greeting message based on the current time.
 *
 * @returns A string representing the current time-based greeting.
 */
export const getGreeting = (): string => {
	const hour = new Date().getHours();
	if (hour < 12) return 'Good morning';
	if (hour < 17) return 'Good afternoon';
	return 'Good evening';
};

// Helper function to get hours until next time period
/**
 * Calculates the number of milliseconds until the next time period (morning, afternoon, or evening) based on the current hour.
 *
 * @returns The number of milliseconds until the next time period.
 */
export function getMillisecondsUntilNextPeriod(): number {
	// Get the current date and hour
	const now = new Date();
	const hour = now.getHours();

	// Determine the next time period based on the current hour
	let nextHour: number;
	if (hour >= 0 && hour < 5) {
		// Wait until morning (5 AM)
		nextHour = 5;
	} else if (hour >= 5 && hour < 12) {
		// Wait until afternoon (12 PM)
		nextHour = 12;
	} else if (hour >= 12 && hour < 18) {
		// Wait until evening (6 PM)
		nextHour = 18;
	} else {
		// Wait until next morning (5 AM next day)
		nextHour = 29;
	}

	// Create a new Date object for the next time period
	const nextTime = new Date();
	nextTime.setHours(nextHour, 0, 0, 0);
	if (nextHour === 29) {
		// If it's 29, increment the date to the next day
		nextTime.setDate(nextTime.getDate() + 1);
	}

	// Return the difference between the next time and the current time in milliseconds
	return nextTime.getTime() - now.getTime();
}

/**
 * Returns a greeting message based on the current time and calculates the time until the next greeting period.
 *
 * @returns An object containing the current greeting and milliseconds until the next greeting period.
 */
export function getGreetingAndNextPeriod(): { greeting: string; millisecondsUntilNext: number } {
	const now = new Date();
	const hour = now.getHours();
	let greeting: string;
	let nextHour: number;

	if (hour >= 0 && hour < 5) {
		greeting = 'Good night';
		nextHour = 5; // Next period starts at 5 AM (morning)
	} else if (hour >= 5 && hour < 12) {
		greeting = 'Good morning';
		nextHour = 12; // Next period starts at 12 PM (afternoon)
	} else if (hour >= 12 && hour < 18) {
		greeting = 'Good afternoon';
		nextHour = 18; // Next period starts at 6 PM (evening)
	} else {
		greeting = 'Good evening';
		nextHour = 29; // Next period starts at 5 AM next day
	}

	// Calculate time until next period
	const nextTime = new Date(now);
	nextTime.setHours(nextHour, 0, 0, 0);
	if (nextHour === 29) {
		nextTime.setDate(nextTime.getDate() + 1);
		nextTime.setHours(5, 0, 0, 0); // Set to 5 AM next day
	}

	const millisecondsUntilNext = nextTime.getTime() - now.getTime();

	return { greeting, millisecondsUntilNext };
}

/**
 * Returns a random mantra from the array of mantras.
 *
 * @returns A random mantra from the array of mantras.
 */
export function getRandomMantra(): Mantra {
	const index = Math.floor(Math.random() * mantras.length);
	return mantras[index];
}

import Chance from 'chance';
import nlp from 'compromise';

// Initialize Chance.js
const chance = new Chance();

// Track recent mantras to avoid duplicates
let recentMantras: string[] = [];

/**
 * Generates a random, quirky, and uplifting mantra.
 *
 * This function combines action words, vivid adjectives, meaningful nouns, and abstract concepts
 * using a set of templates. It leverages Chance.js for random selection and Compromise.js
 * to occasionally swap words with synonyms for variety, ensuring the final mantra is
 * between 4 and 6 words long.
 *
 * @returns {string} A randomly generated mantra, capitalized and formatted.
 *                   If the generated mantra is not within the 4-6 word count range,
 *                   it returns a fallback mantra from a predefined list.
 */
export function generateMantra(): string {
	// const recentMantras: string[] = [];
	// recentMantras.push(recent);
	const chance = new Chance();

	// Action words from your prompt
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

	// Expanded vivid words inspired by your mantras and prompt
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
		'effervescent'
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
		'blaze'
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
		'delight'
	];

	// Expanded templates for 4-6 word mantras
	const templates = [
		'{action} your {adj} {noun}', // e.g., "Dance your quirky soul"
		'{action} the {adj} {noun}', // e.g., "Explore the radiant journey"
		'{action} with {adj} {concept}', // e.g., "Shine with vibrant whimsy"
		'{action} in {adj} {concept}', // e.g., "Flow in whimsical wonder"
		'{action} your {noun} with {concept}', // e.g., "Spark your heart with bliss"
		'{action} a {adj} {noun}', // e.g., "Create a dazzling spark"
		'{action} {adj} {concept} daily', // e.g., "Breathe zesty freedom daily"
		'{action} your {concept} with {noun}', // e.g., "Embrace your wonder with spirit"
		'{action} through {adj} {noun}', // e.g., "Grow through luminous essence"
		'{action} the {concept} within' // e.g., "Spark the radiance within"
	];

	// Step 1: Randomly select template and action word
	const template = chance.weighted(templates, [15, 15, 10, 10, 10, 10, 10, 10, 10, 10]);
	const action = chance.weighted(actionWords, [15, 10, 15, 15, 10, 10, 10, 10, 10, 10]);

	// Step 2: Select words with weighted randomization
	let adj = chance.weighted(adjectives, [20, 20, 15, 10, 10, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
	let noun = chance.weighted(nouns, [15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 5, 5, 5, 5, 5]);
	let concept = chance.weighted(concepts, [15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 5, 5, 5, 5, 5]);

	// Step 3: Use Compromise for synonym variety (adjectives and concepts only)
	const adjDoc = nlp(adj);
	const conceptDoc = nlp(concept);

	// Type assertion to handle missing TypeScript definitions
	interface ConjugateResult {
		synonyms?: string[];
	}

	if (chance.bool({ likelihood: 50 })) {
		const adjConjugate = adjDoc.adjectives().data()[0] as ConjugateResult | undefined;
		const synonyms = adjConjugate?.synonyms || [];
		if (synonyms.length > 0) {
			const validSynonyms = synonyms.filter(
				(s: string) => (adjectives.includes(s) || s.length > 4) && s !== adj
			);
			if (validSynonyms.length > 0) {
				adj = chance.pickone(validSynonyms);
			}
		}
	}
	if (chance.bool({ likelihood: 50 })) {
		const conceptConjugate = conceptDoc.nouns().data()[0] as ConjugateResult | undefined;
		const synonyms = conceptConjugate?.synonyms || [];
		if (synonyms.length > 0) {
			const validSynonyms = synonyms.filter(
				(s: string) => (concepts.includes(s) || s.length > 4) && s !== concept
			);
			if (validSynonyms.length > 0) {
				concept = chance.pickone(validSynonyms);
			}
		}
	}

	// Step 4: Build the mantra
	let mantra = template
		.replace('{action}', action)
		.replace('{adj}', adj)
		.replace('{noun}', noun)
		.replace('{concept}', concept || '');

	// Step 5: Use Compromise to adjust articles for grammatical correctness
	const doc = nlp(mantra);
	if (doc.has('the {adj} {noun}')) {
		const firstLetter = adj[0].toLowerCase();
		const article = 'aeiou'.includes(firstLetter) ? 'an' : 'a';
		mantra = doc.replace('the {adj}', `${article} ${adj}`).text('normal');
	}

	// Step 6: Format (capitalize, normalize spacing)
	mantra = doc.text('normal');
	mantra = mantra.charAt(0).toUpperCase() + mantra.slice(1);

	// Step 7: Ensure 4-6 words and uniqueness
	const wordCount = mantra.split(' ').length;
	if (wordCount < 4 || wordCount > 6 || recentMantras.includes(mantra)) {
		const validMantras = mantras.filter(
			(m) => m.phrase.split(' ').length >= 4 && m.phrase.split(' ').length <= 6
		);
		const fallback = chance.pickone(validMantras).phrase;
		recentMantras.push(fallback);
		if (recentMantras.length > 10) recentMantras.shift();
		return fallback;
	}

	// Step 8: Store mantra to avoid duplicates
	recentMantras.push(mantra);
	if (recentMantras.length > 10) recentMantras.shift();

	return mantra;
}
