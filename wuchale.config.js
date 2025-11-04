// @ts-check
import { adapter as svelte } from '@wuchale/svelte';
import { adapter as js } from 'wuchale/adapter-vanilla';
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
	}
	// ai: {
	// 	name: 'openai',
	// 	translate: async (messages, instruction) => {
	// 		const openai = new OpenAI({
	// 			apiKey: process.env.OPENAI_API_KEY // Use export OPENAI_API_KEY=sk-... in your terminal
	// 		});

	// 		try {
	// 			const response = await openai.responses.create({
	// 				model: 'gpt-5-nano',
	// 				input: [
	// 					{ role: 'system', content: instruction },
	// 					{ role: 'user', content: messages }
	// 				]
	// 			});

	// 			return response.output_text;
	// 		} catch (error) {
	// 			console.error('OpenAI translation error:', error);
	// 			// Return original messages as fallback
	// 			return messages;
	// 		}
	// 	},

	// 	batchSize: 45, // Adjust for rate limits/cost
	// 	parallel: 8 // Parallel batches
	// }
});
