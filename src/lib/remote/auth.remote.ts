import { getRequestEvent, query, form } from '$app/server';
import { error, redirect, fail } from '@sveltejs/kit';
import * as v from 'valibot';
import * as auth from '$lib/server/auth';
import { prisma } from '$lib/server/db';
import { dev } from '$app/environment';

// Type for the current user (matches what auth.ts returns)
type CurrentUser = {
	id: string;
	username: string;
	role: string;
	createdAt: Date;
} | null;

export const getCurrentUser = query(async (): Promise<CurrentUser> => {
	const event = getRequestEvent();

	if (!event) {
		return null;
	}

	return event.locals.user;
});

// Login schema
const loginSchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(3, 'Username must be at least 3 characters'),
		v.maxLength(31, 'Username must be at most 31 characters'),
		v.regex(
			/^[a-z0-9_-]+$/,
			'Username must contain only lowercase letters, numbers, underscores, and hyphens'
		)
	),
	password: v.pipe(
		v.string(),
		v.minLength(6, 'Password must be at least 6 characters'),
		v.maxLength(255, 'Password must be at most 255 characters')
	)
});

// Register schema
const registerSchema = v.object({
	username: v.pipe(
		v.string(),
		v.minLength(3, 'Username must be at least 3 characters'),
		v.maxLength(31, 'Username must be at most 31 characters'),
		v.regex(
			/^[a-z0-9_-]+$/,
			'Username must contain only lowercase letters, numbers, underscores, and hyphens'
		)
	),
	password: v.pipe(
		v.string(),
		v.minLength(6, 'Password must be at least 6 characters'),
		v.maxLength(255, 'Password must be at most 255 characters')
	),
	confirmPassword: v.string(),
	role: v.picklist(['user', 'tester'], 'Role must be either user or tester')
});

// Login form
export const loginUser = form(loginSchema, async (data, invalid) => {
	const event = getRequestEvent();

	const existingUser = await prisma.user.findUnique({
		where: { username: data.username }
	});

	if (!existingUser) {
		invalid(invalid.username('Incorrect username or password'));
		return; // This line won't be reached, invalid() throws
	}

	const validPassword = await auth.verifyPassword(data.password, existingUser.passwordHash);

	if (!validPassword) {
		invalid(invalid.password('Incorrect username or password'));
		return; // This line won't be reached, invalid() throws
	}

	const session = await auth.createSession(existingUser!.id);
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

	redirect(303, finalRedirect);
});

// Register form
export const registerUser = form(registerSchema, async (data) => {
	console.log('Register form submitted with data:', data);

	const event = getRequestEvent();

	// Check if passwords match
	if (data.password !== data.confirmPassword) {
		console.log('Passwords do not match');
		error(400, 'Passwords do not match');
	}

	console.log('Passwords match, checking if user exists');

	// Check if user already exists
	const existingUser = await prisma.user.findUnique({
		where: { username: data.username }
	});

	if (existingUser) {
		console.log('User already exists:', data.username);
		error(400, 'Username is already taken');
	}

	console.log('User does not exist, creating user');

	// Create the user
	const userId = generateUserId();
	const passwordHash = await auth.generatePasswordHash(data.password);

	await prisma.user.create({
		data: {
			id: userId,
			username: data.username,
			passwordHash,
			role: data.role
		}
	});

	console.log('User created, creating session');

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
});

function generateUserId(length = 21): string {
	const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	return Array.from(crypto.getRandomValues(new Uint8Array(length)))
		.map((x) => alphabet[x % alphabet.length])
		.join('');
}
