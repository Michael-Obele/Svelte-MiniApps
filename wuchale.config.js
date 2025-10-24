// @ts-check
import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
import { defineConfig } from 'wuchale';
import { gemini } from 'wuchale';

export default defineConfig({
	// sourceLocale is en by default
	otherLocales: ['es'],
	// otherLocales: ['es', 'fr', 'de', 'zh', 'ja', 'pt', 'ar'],
	adapters: {
		main: svelte(),
		js: js({
			files: ['src/**/+{page,layout}.{js,ts}', 'src/**/+{page,layout}.server.{js,ts}']
		})
	},
	ai: gemini({
		batchSize: 40,
		parallel: 5
	})
});
