/// <reference types="@sveltejs/kit" />

declare module '$env/static/public' {
	export const PUBLIC_BASE_URL: string;
	export const PUBLIC_GITHUB_CALLBACK_URL: string;
	export const PUBLIC_GOOGLE_CALLBACK_URL: string;
	export const PUBLIC_FEATURE_FLAG: string;
	// Add any other public environment variables here
}

declare module '$env/static/private' {
	export const ANALYTICS_ID: string;
	export const AUTH_GITHUB_ID: string;
	export const AUTH_GITHUB_SECRET: string;
	export const AUTH_GOOGLE_ID: string;
	export const AUTH_GOOGLE_SECRET: string;
	export const MISTRAL_API_KEY: string;
	export const EXCHANGE_RATE_API_KEY: string;
	// Add any other private environment variables here
}

declare module '$env/dynamic/public' {
	export const env: {
		PUBLIC_BASE_URL: string;
		PUBLIC_GITHUB_CALLBACK_URL: string;
		PUBLIC_GOOGLE_CALLBACK_URL: string;
		PUBLIC_FEATURE_FLAG: string;
		// Add any other public environment variables here
		[key: string]: string;
	};
}

declare module '$env/dynamic/private' {
	export const env: {
		ANALYTICS_ID: string;
		AUTH_GITHUB_ID: string;
		AUTH_GITHUB_SECRET: string;
		AUTH_GOOGLE_ID: string;
		AUTH_GOOGLE_SECRET: string;
		MISTRAL_API_KEY: string;
		EXCHANGE_RATE_API_KEY: string;
		// Add any other private environment variables here
		[key: string]: string;
	};
}
