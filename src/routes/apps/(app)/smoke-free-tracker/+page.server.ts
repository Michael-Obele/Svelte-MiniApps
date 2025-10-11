import type { PageServerLoad } from './$types';
import { loadSmokeFreeData } from '$lib/remote';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	const user = locals.user;

	if (user) {
		try {
			// Load user's smoke-free data from database
			const data = await loadSmokeFreeData();
			return {
				user: {
					id: user.id,
					username: user.username
				},
				attempts: data.attempts,
				cravings: data.cravings
			};
		} catch (error) {
			console.error('Error loading smoke-free data:', error);
			// Return user info but no data on error
			return {
				user: {
					id: user.id,
					username: user.username
				},
				attempts: [],
				cravings: []
			};
		}
	}

	// User not authenticated
	return {
		user: null,
		attempts: [],
		cravings: []
	};
};
