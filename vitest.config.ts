import { fileURLToPath } from 'node:url';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// SvelteKit 3 keeps project config in `vite.config.ts` and no longer generates
// a `svelte.config.js`, so the standalone Svelte plugin must be told not to
// look for one. This plugin compiles `.svelte` components as well as the
// `.svelte.ts` / `.svelte.js` modules that contain Svelte 5 runes.
export default defineConfig({
	plugins: [
		svelte({
			configFile: false,
			preprocess: [vitePreprocess()]
		})
	],
	resolve: {
		alias: {
			// `#lib` is resolved natively via the `imports` field in package.json.
			'@': fileURLToPath(new URL('./src/lib/components', import.meta.url)),
			// SvelteKit's runtime modules aren't available outside the app build,
			// so unit tests resolve them to lightweight stubs.
			$app: fileURLToPath(new URL('./vitest-mocks/app', import.meta.url))
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/vitest-setup.ts']
	}
});
