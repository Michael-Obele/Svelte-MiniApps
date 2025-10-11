import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';

const oauthErrors = {
	missing_params: 'Missing OAuth parameters',
	invalid_state: 'Invalid OAuth state',
	invalid_code: 'Invalid authorization code',
	github_api_error: 'Failed to fetch GitHub user data'
} as const;

type OAuthError = keyof typeof oauthErrors;

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		redirect(302, '/');
	}

	const error = event.url.searchParams.get('error') as OAuthError | null;
	const errorMessage = error ? oauthErrors[error] : null;

	return {
		error: errorMessage,
		user: event.locals.user
	};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Invalid username',
				username: String(username)
			});
		}
		if (!validatePassword(password)) {
			return fail(400, {
				message: 'Invalid password',
				username: username as string
			});
		}
		const existingUser = await prisma.user.findUnique({
			where: { username: username as string }
		});

		if (!existingUser) {
			return fail(400, {
				message: 'Incorrect username or password',
				username: username as string
			});
		}

		const validPassword = await auth.verifyPassword(password as string, existingUser.passwordHash);

		if (!validPassword) {
			return fail(400, {
				message: 'Incorrect username or password',
				username: username as string
			});
		}

		const session = await auth.createSession(existingUser.id);
		event.cookies.set(auth.sessionCookieName, session.id, {
			path: '/',
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		console.info('User logged in');

		const redirectTo = event.url.searchParams.get('redirect') || '/';
		// Validate redirect URL to prevent open redirect attacks
		const isValidRedirect = redirectTo.startsWith('/') && !redirectTo.includes('://');
		const finalRedirect = isValidRedirect ? redirectTo : '/';

		redirect(301, finalRedirect);
	}
};

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
