// routes/login/github/+server.ts
import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { github } from '$lib/server/oauth';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	console.log('🔍 Starting GitHub OAuth flow');

	// Check if user already has a session
	if (event.cookies.get('session')) {
		console.log('✓ User already has session, redirecting to home');
		redirect(302, '/');
	}

	// Get redirect URL from query params
	const redirectTo = event.url.searchParams.get('redirect') || '/';
	// Validate redirect URL to prevent open redirect attacks
	const isValidRedirect = redirectTo.startsWith('/') && !redirectTo.includes('://');

	// Clear any existing oauth state and redirect cookie
	event.cookies.delete('github_oauth_state', { path: '/' });
	event.cookies.delete('oauth_redirect', { path: '/' });
	console.log('✓ Cleared existing OAuth state and redirect');

	// Generate new state
	const state = generateState();
	console.log('✓ Generated new state');

	// Set the state cookie with proper security options
	event.cookies.set('github_oauth_state', state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});
	console.log('✓ Set OAuth state cookie');

	// Set redirect cookie if valid
	if (isValidRedirect) {
		event.cookies.set('oauth_redirect', redirectTo, {
			path: '/',
			secure: import.meta.env.PROD,
			httpOnly: true,
			maxAge: 60 * 10, // 10 minutes
			sameSite: 'lax'
		});
		console.log('✓ Set OAuth redirect cookie');
	}

	// Create authorization URL with read:user scope
	const url = github.createAuthorizationURL(state, ['read:user']);
	console.log('✓ Created authorization URL:', url.toString());

	console.log('✅ Redirecting to GitHub login page');

	// Use a 303 See Other redirect to prevent the browser from resubmitting
	redirect(303, url.toString());
}
