import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (url.hostname === 'next.svelte-apps.me') {
		throw redirect(302, 'https://svelte-apps.me');
	}
	return {
		user: locals.user
	};
};