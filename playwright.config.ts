import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		// The production build takes ~2.5 minutes; give it room.
		timeout: 300_000
	},

	testDir: 'e2e'
});
