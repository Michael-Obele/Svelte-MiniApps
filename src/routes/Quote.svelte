<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { mantras } from '$lib/utility/greetings';
	import Chance from 'chance';
	import nlp from 'compromise';

	let currentMantra = $state('');

	// Initialize Chance.js
	const chance = new Chance();

	// Function to generate a mantra using Chance.js and Compromise
	function generateMantra(): string {
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

		// Vivid words inspired by your mantras and prompt
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
			'serendipitous'
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
			'essence'
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
			'adventure'
		];

		// Templates for 4-6 word mantras
		const templates = [
			'{action} your {adj} {noun}', // e.g., "Dance your quirky soul"
			'{action} the {adj} {noun}', // e.g., "Explore the radiant journey"
			'{action} with {adj} {noun}', // e.g., "Shine with vibrant essence"
			'{action} in {adj} {concept}', // e.g., "Flow in whimsical wonder"
			'{action} your {noun} with {concept}' // e.g., "Spark your heart with bliss"
		];

		// Step 1: Randomly select template and action word using Chance.js
		const template = chance.pickone(templates);
		const action = chance.pickone(actionWords);

		// Step 2: Use Compromise to enhance word selection
		const doc = nlp(template);

		// Get random adjective, noun, and concept
		let adj = chance.pickone(adjectives);
		let noun = chance.pickone(nouns);
		let concept = chance.pickone(concepts);

		// Use Compromise to optionally find a synonym for variety
		const adjDoc = nlp(adj);
		const nounDoc = nlp(noun);
		const conceptDoc = nlp(concept);

		// Replace with a synonym 30% of the time for uniqueness
		if (chance.bool({ likelihood: 30 })) {
			const synonyms = adjDoc.adjectives().conjugate()[0]?.synonyms || [];
			if (synonyms.length > 0) {
				adj = chance.pickone(
					synonyms.filter((s: string) => adjectives.includes(s) || s.length > 4)
				);
			}
		}
		if (chance.bool({ likelihood: 30 })) {
			const synonyms = nounDoc.nouns().conjugate()[0]?.synonyms || [];
			if (synonyms.length > 0) {
				noun = chance.pickone(synonyms.filter((s: string) => nouns.includes(s) || s.length > 4));
			}
		}

		// Step 3: Build the mantra
		let mantra = template
			.replace('{action}', action)
			.replace('{adj}', adj)
			.replace('{noun}', noun)
			.replace('{concept}', concept || '');

		// Step 4: Use Compromise to format (capitalize first letter, ensure spacing)
		const formattedDoc = nlp(mantra);
		mantra = formattedDoc.text('normal'); // Normalize spacing
		mantra = mantra.charAt(0).toUpperCase() + mantra.slice(1);

		// Step 5: Ensure 4-6 words
		const wordCount = mantra.split(' ').length;
		if (wordCount < 4 || wordCount > 6) {
			// Fallback to a static mantra if word count is off
			console.log('Fallback');
			return chance.pickone(mantras).phrase;
		}

		return mantra;
	}

	// Generate initial mantra
	currentMantra = generateMantra();

	// Function to handle button click
	function handleGenerate() {
		currentMantra = generateMantra();
	}
</script>

<div>
	<p>{currentMantra}</p>
	<button onclick={handleGenerate}>New Mantra</button>
</div>
