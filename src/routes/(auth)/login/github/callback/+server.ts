// routes/login/github/callback/+server.ts
import { generateSessionToken, createSession, setSessionTokenCookie, SESSION_COOKIE_NAME } from "$lib/server/session";
import { github } from "$lib/server/oauth";
import { db } from '$lib/server/db';
import { redirect } from "@sveltejs/kit";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";

const prisma = db;

export async function GET(event: RequestEvent): Promise<Response> {
	console.log(' GitHub OAuth Callback Started');
	
	// Check if user already has a session
	if (event.cookies.get(SESSION_COOKIE_NAME)) {
		console.log(' User already has session, redirecting to home');
		redirect(303, "/");
	}

	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get("github_oauth_state");

	console.log(' OAuth Parameters:', {
		code: code ? ' Present' : ' Missing',
		state: state ? ' Present' : ' Missing',
		storedState: storedState ? ' Present' : ' Missing'
	});

	if (!code || !state || !storedState) {
		console.error(' Missing required OAuth parameters:', { code, state, storedState });
		// Use 303 for redirects after POST-like operations
		redirect(303, "/login?error=missing_params");
	}

	if (state !== storedState) {
		console.error(' State mismatch:', { 
			receivedState: state,
			storedState: storedState
		});
		redirect(303, "/login?error=invalid_state");
	}

	console.log(' State validation passed');
	// Clear the state cookie immediately after validation
	event.cookies.delete("github_oauth_state", { path: "/" });

	let tokens: OAuth2Tokens;
	try {
		console.log(' Validating authorization code...');
		tokens = await github.validateAuthorizationCode(code);
		console.log(' Authorization code validated successfully');
	} catch (e) {
		console.error(' Failed to validate authorization code:', e);
		redirect(303, "/login?error=invalid_code");
	}

	console.log(' Fetching GitHub user data...');
	const githubUserResponse = await fetch("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`
		}
	});

	if (!githubUserResponse.ok) {
		console.error(' GitHub API request failed:', {
			status: githubUserResponse.status,
			statusText: githubUserResponse.statusText
		});
		redirect(303, "/login?error=github_api_error");
	}

	const githubUser = await githubUserResponse.json();
	console.log(' GitHub user data received:', {
		id: githubUser.id,
		login: githubUser.login
	});

	const githubUserId = githubUser.id.toString();
	const githubUsername = githubUser.login;

	// Find or create user using Prisma
	console.log(' Looking for existing user...');
	let user = await prisma.user.findUnique({
		where: {
			githubId: githubUserId
		}
	});

	if (!user) {
		console.log(' Creating new user...');
		user = await prisma.user.create({
			data: {
				username: githubUsername,
				githubId: githubUserId,
				passwordHash: '' // OAuth users don't need a password
			}
		});
		console.log(' New user created');
	} else {
		console.log(' Existing user found');
	}

	console.log(' Creating session...');
	// Create a session directly in the database
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(crypto.randomUUID())));
	
	const session = await prisma.session.create({
		data: {
			id: sessionId,
			userId: user.id,
			expiresAt
		}
	});
	
	// Set the session ID (not token) as the cookie value
	event.cookies.set(SESSION_COOKIE_NAME, session.id, {
		path: "/",
		secure: import.meta.env.PROD,
		httpOnly: true,
		sameSite: "lax",
		expires: session.expiresAt
	});
	
	console.log(' Session created successfully');

	console.log(' OAuth flow completed successfully, redirecting to home page');
	// Use 303 See Other for the final redirect
	redirect(303, "/");
}