import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.svelte.miniapps',
	appName: 'Svelte MiniApps',
	webDir: 'build',
	server: {
		cleartext: true
	},
	loggingBehavior: 'debug'
};

export default config;
