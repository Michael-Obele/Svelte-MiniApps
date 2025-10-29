import type { PageServerLoad } from './$types';
import { generateMantra } from '$lib/utility/greetings.server';

// Note: Svelte Load function
export const load: PageServerLoad = async (event) => {
	return {
		user: event.locals.user,
		mantra: generateMantra()
	};
};
