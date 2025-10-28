// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/// <reference types="@sveltejs/enhanced-img" />

declare global {
	namespace App {
		interface Locals {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			session: import('$lib/server/auth').SessionValidationResult['session'];
		}

		interface LayoutData {
			user: import('$lib/server/auth').SessionValidationResult['user'];
			ANALYTICS_ID: string;
		}
	}
}

export {};
