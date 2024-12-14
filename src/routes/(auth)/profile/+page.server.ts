import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verify, hash } from '@node-rs/argon2';
import {prisma}from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		redirect(302, '/login');
	}
	return {
		user: event.locals.user
	};
};