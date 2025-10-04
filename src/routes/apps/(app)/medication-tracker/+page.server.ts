import type { PageServerLoad } from './$types';
import { loadMedicationData } from '$lib/remote';

export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	const user = locals.user;

	// If user is authenticated, load their medication data from the server
	if (user) {
		try {
			const data = await loadMedicationData();
			return {
				user,
				sessions: data.sessions,
				logs: data.logs
			};
		} catch (error) {
			console.error('Failed to load medication data:', error);
			return {
				user,
				sessions: [],
				logs: []
			};
		}
	}

	return {
		user: null,
		sessions: [],
		logs: []
	};
};
