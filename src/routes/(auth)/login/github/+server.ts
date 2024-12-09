// routes/login/github/+server.ts
import { redirect } from "@sveltejs/kit";
import { generateState } from "arctic";
import { github } from "$lib/server/oauth";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
	console.log('🔍 Starting GitHub OAuth flow');
	
	// Check if user already has a session
	if (event.cookies.get("session")) {
		console.log('✓ User already has session, redirecting to home');
		redirect(302, "/");
	}

	// Clear any existing oauth state
	event.cookies.delete("github_oauth_state", { path: "/" });
	console.log('✓ Cleared existing OAuth state');

	// Generate new state
	const state = generateState();
	console.log('✓ Generated new state');
	
	// Set the state cookie with proper security options
	event.cookies.set("github_oauth_state", state, {
		path: "/",
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: "lax"
	});
	console.log('✓ Set OAuth state cookie');

	// Create authorization URL with read:user scope
	const url = github.createAuthorizationURL(state, ["read:user"]);
	console.log('✓ Created authorization URL:', url.toString());
	
	console.log('✅ Redirecting to GitHub login page');
	
	// Use a 303 See Other redirect to prevent the browser from resubmitting
	redirect(303, url.toString());
}