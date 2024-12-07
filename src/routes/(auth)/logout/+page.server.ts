import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	return { user: event.locals.user };
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return redirect(302, '/');
		}
		await auth.invalidateSession(event.locals.session.id);
		event.cookies.delete(auth.sessionCookieName, { path: '/' });
		console.info('User logged out');

		return redirect(302, '/');
	}
};
