// @ts-check
import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { defineConfig } from 'wuchale';

const deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

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
	ai: {
		name: `DeepSeek (${deepseekModel})`,
		batchSize: 40,
		parallel: 5,
		translate: translateWithDeepSeek
	}
});
