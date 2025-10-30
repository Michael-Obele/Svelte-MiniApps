import { getSavedPasswords, getCurrentUser } from '$lib/remote';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const currentUser = await getCurrentUser();

	if (!currentUser) {
		redirect(307, '/apps/random-password-generator');
	}

	const passwords = await getSavedPasswords();

	return {
		passwords,
		user: currentUser
	};
};
