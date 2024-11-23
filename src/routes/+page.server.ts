import { MISTRAL_API_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';
import { mantras } from '$lib/utils/greetings';
import { Mistral } from '@mistralai/mistralai';

// Initialize Mistral client
const mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });

async function generateDailyMantra() {
	try {
		const prompt = "Generate exactly one casual life mantra in 4-6 words. Must start with an action word (do, find, make, keep, let). Make it conversational like 'Do more of what makes you happy'. Focus on everyday joy or self-care. Do not provide multiple options. Use simple, direct words. Return only the mantra text with no additional formatting or punctuation.";

		const response = await mistralClient.chat.complete({
			model: "mistral-tiny",
			messages: [{ role: 'user', content: prompt }]
		});

		console.log('Mistral response:', response);
		if (response.choices) {
			const mantra = response.choices[0]?.message?.content || mantras[0].phrase;
			console.log('Generated mantra:', mantra);
			return mantra as string;
		}
	} catch (error: any) {
		console.error('Error generating mantra:', error);

		// If we hit rate limit or any other error, use a random mantra from our collection
		if (error.status === 429) {
			console.log('Rate limit reached, using fallback mantra');
		}

		// Get a random mantra from our collection
		const fallbackMantra = mantras[Math.floor(Math.random() * mantras.length)].phrase;
		console.log('Using fallback mantra:', fallbackMantra);
		return fallbackMantra;
	}
}

export const load: PageServerLoad = async (event) => {
	const mantra = await generateDailyMantra();
	return {
		user: event.locals.user,
		mantra
	};
};

export const actions = {
	generatemantra: async () => {
		const mantra = await generateDailyMantra();
		return { mantra };
	}
};