import { defineEnvVars } from '@sveltejs/kit/env';

// @migration-task Review usage of dynamic environment variables. They fall back to the empty string if not present, which may not be what you want.
export const variables = defineEnvVars({
	ANALYTICS_ID: { static: true },
	GITHUB_TOKEN: { schema: (input) => input ?? '' },
	VITE_GITHUB_TOKEN: { schema: (input) => input ?? '' },
	AUTH_GOOGLE_ID: { static: true },
	AUTH_GOOGLE_SECRET: { static: true },
	PUBLIC_GOOGLE_CALLBACK_URL: { public: true, static: true },
	AUTH_GITHUB_ID: { static: true },
	AUTH_GITHUB_SECRET: { static: true },
	PUBLIC_GITHUB_CALLBACK_URL: { public: true, static: true }
});
