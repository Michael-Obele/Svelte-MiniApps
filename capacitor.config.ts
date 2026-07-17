import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.svelte.miniapps',
	appName: 'Svelte MiniApps',
	webDir: 'build',
	server: {
		// Production: load from the live SvelteKit server
		// Override with CAPACITOR_SERVER_URL env var for local dev
		url: process.env.CAPACITOR_SERVER_URL || 'https://svelte-apps.me/',
		cleartext: !!process.env.CAPACITOR_SERVER_URL
	}
};

export default config;
