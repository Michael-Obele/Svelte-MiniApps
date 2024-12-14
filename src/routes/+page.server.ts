import { MISTRAL_API_KEY } from '$env/static/private';
import { prisma } from '@/server/db';
import type { PageServerLoad } from './$types';
import { getRandomMantra, mantras } from '@/utility/greetings';
import { Mistral } from '@mistralai/mistralai';
import { fail } from '@sveltejs/kit';

// Initialize Mistral client
const mistralClient = new Mistral({ apiKey: MISTRAL_API_KEY });

async function generateDailyMantra(): Promise<string> {
	try {
		const prompt = `Generate a unique and unexpected life mantra in 4-6 words. 
Rules:
1. Start with one of these action words (randomly choose) or something like these: dance, breathe, explore, embrace, create, dream, grow, shine, flow, spark
2. Make it feel fresh and unconventional, avoiding common phrases or repetitions
3. Focus on joy, growth, or self-discovery and humor or playfulness.
4. Use vivid, specific words instead of generic ones
5. Keep the tone casual and conversational
6. Each generation should feel distinctly different from previous ones, be as unique as possible
7. IMPORTANT: Each word must be separated by a single space
8. Do not combine words together - keep them as separate words
9. Format example: "Spark Your Inner Light" (correct) vs "SparkYourInnerLight" (incorrect)
10. Don't return a mantra that's longer than 8 words

Return only a single mantra text with it's words separated by spaces, no additional formatting or punctuation.`;

		const response = await mistralClient.chat.complete({
			model: "mistral-small-latest",
			messages: [{ role: 'user', content: prompt }], stop: ['.']
		});

		if (!response.choices) {
			throw new Error('No response from Mistral');
		}
		const mantra = response.choices[0]?.message?.content || mantras[0].phrase;
		console.log('Generated mantra:', mantra);
		return mantra as string;

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

export const load: PageServerLoad = async (event) => {
	let mantra: string;
	const storedMantra = event.cookies.get('daily_mantra');
    const likedMantra = event.cookies.get('liked_mantra');


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
        like:likedMantra?? 'like'
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

		return { mantra, like: 'like' };
	},

	likeMantra: async (event) => {
		const formData = await event.request.formData();
		const like = formData.get('like') as String;
		const mantra = formData.get('mantra')??'' as String;
		let LikeState = like === 'like' ? 'unlike' : 'like'

		console.log( like === 'like' ? 'Liked' : 'Unliked', mantra);

		if(!mantra && !like) {
			return fail(400, {
				message: 'Mantra is required',
				mantra: mantra,
			
			});
		}

		// Check if mantra already exists
		const existingMantra = await prisma.mantra.findUnique({
			where: {
				content: mantra as string
			}
		});

		if (existingMantra) {
			await prisma.mantra.update({
				where: {
					id: existingMantra.id
				},
				data: {
					like: like === 'like' ? true : false
				}
			});
			console.log( like === 'like' ? 'Liked' : 'Unliked', mantra);
			return {like: LikeState}
		}

		const likeMantra = await prisma.mantra.create({
			data: {
				content: mantra as string,
				like: like === 'like' ? true : false,
				user: {
					connect: { id: event.locals.user?.id }
				}
			}
		});
		

        event.cookies.set('liked_mantra', LikeState , {
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

		return {like: LikeState}

	}

};
