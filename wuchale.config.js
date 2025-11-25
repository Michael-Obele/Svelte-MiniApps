// @ts-check
import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
import { gemini } from 'wuchale';
import { defineConfig } from 'wuchale';

export default defineConfig({
	// sourceLocale is en by default
	otherLocales: ['es', 'fr', 'de', 'zh', 'ja', 'pt'],
	adapters: {
		main: svelte({
			files: {
				include: ['src/**/*.svelte', 'src/**/*.svelte.{js,ts}', 'src/**/*.client.svelte.{js,ts}'],
				ignore: [
					'**/node_modules/**',
					'src/lib/assets/**',
					'src/routes/test-charts/**',
					'src/routes/test-*/**',
					'src/routes/apps/(app)/github-contribution-tracker/**'
				]
			}
		}),
		js: js({
			files: ['src/**/+{page,layout}.{js,ts}', 'src/**/+{page,layout}.server.{js,ts}']
		})
	},
	ai: gemini({
		batchSize: 45,
		parallel: 8,
		think: true
	})
});
