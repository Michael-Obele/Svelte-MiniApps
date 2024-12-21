import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async (event) => {
	if (event.url.hostname === 'next.svelte-apps.me') {
		throw redirect(302, 'https://svelte-apps.me');
	}
	return {
		user: event.locals.user
	};
};
