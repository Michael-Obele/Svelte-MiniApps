import { MISTRAL_API_KEY } from '$env/static/private';
import { prisma } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { getRandomMantra, mantras } from '$lib/utility/greetings';
import { Mistral } from '@mistralai/mistralai';
import { fail } from '@sveltejs/kit';

// Initialize Mistral client
const mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });

async function generateDailyMantra(): Promise<string> {
	try {
		const prompt = `Generate a unique and unexpected life mantra in 4-6 words. 
Rules:
1. Start with one of these action words (randomly choose): dance, breathe, explore, embrace, create, dream, grow, shine, flow, spark.
2. Make it feel fresh and unconventional, avoiding common phrases or repetitions.
3. Focus on joy, growth, self-discovery, humor, or playfulness.
4. Use vivid, specific words instead of generic ones.
5. Keep the tone casual and conversational.
6. Each generation should feel distinctly different from previous ones, be as unique as possible.
7. IMPORTANT: Each word must be separated by a single space.
8. Do not combine words together - keep them as separate words.
9. Format example: "Spark Your Inner Light" (correct) vs "SparkYourInnerLight" (incorrect).
10. Do not return a mantra longer than 8 words.

Return only a single mantra text with its words separated by spaces, no additional formatting or punctuation.`;

		const response = await mistralClient.chat.complete({
			model: 'mistral-small-latest',
			messages: [{ role: 'user', content: prompt }],
			stop: ['.']
		});

		if (!response.choices || response.choices.length === 0) {
			throw new Error('No response from Mistral');
		}
		const content = response.choices[0]?.message?.content;
		const mantra = typeof content === 'string' ? content.trim() : getRandomMantra().phrase;
		console.log('Generated mantra:', mantra);
		return mantra;
	} catch (error: any) {
		console.error('Error generating mantra:', error);

		// If we hit rate limit or any other error, use a random mantra from our collection
		if (error.status === 429) {
			console.error('Rate limit reached, using fallback mantra');
		}

		// Get a random mantra from our collection
		const fallbackMantra = getRandomMantra().phrase;
		console.log('Using fallback mantra:', fallbackMantra);
		return fallbackMantra;
	}
}

async function updateMantraLikeState(mantra: string, userId: string | undefined) {
	const existingMantra = await prisma.mantra.findUnique({
		where: {
			content: mantra
		}
	});

	if (existingMantra) {
		const newLikeState = !existingMantra.like;
		await prisma.mantra.update({
			where: {
				id: existingMantra.id
			},
			data: {
				like: newLikeState
			}
		});
		console.log(newLikeState ? 'Liked' : 'Unliked', mantra);
		return newLikeState;
	}

	const newLikeState = true;
	await prisma.mantra.create({
		data: {
			content: mantra,
			like: newLikeState,
			user: {
				connect: { id: userId }
			}
		}
	});
	return newLikeState;
}

export const load: PageServerLoad = async (event) => {
	let mantra: string;
	const storedMantra = event.cookies.get('daily_mantra');

	// Generate new mantra if:
	// 1. No stored mantra exists
	// 2. The stored mantra is from a previous day
	if (!storedMantra) {
		mantra = await generateDailyMantra();

		// Store the new mantra and timestamp in cookies
		event.cookies.set('daily_mantra', mantra, {
			path: '/',
			maxAge: 60 * 60 * 24 // 1 day
		});
	} else {
		mantra = storedMantra;
	}

	return {
		user: event.locals.user,
		mantra,
		like: false // Always send false initially
	};
};

export const actions = {
	generatemantra: async (event) => {
		const mantra = await generateDailyMantra();

		// Update the stored mantra and timestamp
		event.cookies.set('daily_mantra', mantra, {
			path: '/',
			maxAge: 60 * 60 * 24 // 1 day
		});

		return { mantra, like: false };
	},

	likeMantra: async (event) => {
		const formData = await event.request.formData();
		const mantra = formData.get('mantra') as string;

		if (!mantra) {
			return fail(400, {
				message: 'Mantra is required',
				mantra: mantra
			});
		}

		const newLikeState = await updateMantraLikeState(String(mantra), event.locals.user?.id);
		return { like: newLikeState };
	}
};
