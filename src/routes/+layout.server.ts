import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { ANALYTICS_ID } from '$app/env/private';

export const load: LayoutServerLoad = async (event) => {
	return {
		user: event.locals.user,
		ANALYTICS_ID
	};
};
