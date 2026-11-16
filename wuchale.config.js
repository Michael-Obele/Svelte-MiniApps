import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { defineConfig } from 'wuchale';

const deepseekModel = 'deepseek-v4-flash';

/**
 * Translation is opt-in: set WUCHALE_TRANSLATE=1 (plus DEEPSEEK_API_KEY) when
 * running `bunx wuchale` manually. Without the flag the `ai` config is
 * undefined, which tells the vite plugin and the CLI to only extract strings
 * into the .po catalogs and never call the AI — so `bun run build` and `bun
 * dev` never auto-translate and never require an API key.
 */
const useAiTranslation = !!process.env.WUCHALE_TRANSLATE;

/**
 * @param {string} messages
 * @param {string} instruction
 */
async function translateWithDeepSeek(messages, instruction) {
	if (!process.env.DEEPSEEK_API_KEY) {
		throw new Error('Missing DEEPSEEK_API_KEY for Wuchale live translation.');
	}

	const { text } = await generateText({
		model: deepseek(deepseekModel),
		system: instruction,
		prompt: messages,
		temperature: 0
	});

	return text;
}

export default defineConfig({
	locales: ['en', 'de', 'ja'],
	// On dev, only messages already in the catalogue are transformed. New
	// strings pass through as their source text, so adding an app never
	// renders `[i18n-404]` markers. Run `bun run extract` to add new messages.
	dev: 'read',
	adapters: {
		main: svelte({
			loader: 'sveltekit',
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
			loader: 'vite',
			files: ['src/**/+{page,layout}.{js,ts}', 'src/**/+{page,layout}.server.{js,ts}']
		})
	},
	ai: useAiTranslation
		? {
				name: `DeepSeek (${deepseekModel})`,
				batchSize: 40,
				parallel: 5,
				group: {},
				translate: translateWithDeepSeek
			}
		: null
});
