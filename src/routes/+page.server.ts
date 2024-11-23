import { GoogleGenerativeAI } from '@google/generative-ai';
import { Gemini_API_KEY, Gemini_Model } from '$env/static/private';
import type { PageServerLoad } from './$types';
import { mantras } from '$lib/utils/greetings';

async function generateDailyMantra() {
	try {
		const genAI = new GoogleGenerativeAI(Gemini_API_KEY);
		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-flash', generationConfig: {
				candidateCount: 1,
				maxOutputTokens: 10,
				temperature: 0.95,
			},
		});
		const prompt = "Create a simple, casual life mantra (4-6 words) that feels like friendly advice. Start with an action word (like 'do', 'find', 'make', 'keep', 'let'). Make it feel natural and conversational, similar to 'Do more of what makes you happy'. Focus on everyday joy, self-care, or simple wisdom. Don't use complex or formal language.";
		const result = await model.generateContent(prompt);
		const mantra = result.response.text().replace(/\*\*/g, '').trim();
		console.log('Generated mantra:', mantra);
		return mantra;
	} catch (error: any) {
		console.error('Error generating mantra:', error);

		// If we hit rate limit or any other error, use a random mantra from our collection
		if (error.status === 429) {
			console.log('Rate limit reached, using fallback mantra');
		}

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