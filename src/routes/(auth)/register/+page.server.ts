import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import * as auth from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');
		const role = formData.get('role'); // Get the role from the form data

		console.log('Form Data:', { username, password, confirmPassword, role });

		if (!username || !password || !role) {
			return fail(400, {
				message: 'All fields are required',
				username: String(username),
				password: String(password),
				role: String(role)
			});
		}

		if (!validateUsername(username)) {
			return fail(400, {
				message:
					'Username must be between 3 and 31 characters and contain only lowercase letters, numbers, underscores, and hyphens',
				username: String(username)
			});
		}
		if (!validatePassword(password)) {
			return fail(400, {
				message: 'Password must be at least 6 characters long',
				username: username as string
			});
		}
		if (password !== confirmPassword) {
			return fail(400, {
				message: 'Passwords do not match',
				username: username as string
			});
		}

		const existingUser = await prisma.user.findUnique({
			where: { username: username as string }
		});

		if (existingUser) {
			return fail(400, {
				message: 'Username is already taken',
				username: username as string
			});
		}

		// Create the user
		const userId = generateUserId();
		const passwordHash = await auth.generatePasswordHash(password as string);

		await prisma.user.create({
			data: {
				id: userId,
				username: username as string,
				passwordHash,
				role: role as string // Add the role to the user creation
			}
		});

		const session = await auth.createSession(userId);
		event.cookies.set(auth.sessionCookieName, session.id, {
			path: '/',
			sameSite: 'lax',
			httpOnly: true,
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		console.log('User created and session started:', { userId, sessionId: session.id });

		redirect(302, '/');
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

function generateUserId(length = 21): string {
	const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	return Array.from(crypto.getRandomValues(new Uint8Array(length)))
		.map((x) => alphabet[x % alphabet.length])
		.join('');
}
