import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Simple auth check - all data loading is now done via remote functions
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}

	return {};
};
