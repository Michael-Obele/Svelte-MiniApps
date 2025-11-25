import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Auth check for all profile routes - data loading is done via remote functions
export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	return {};
};
