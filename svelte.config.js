import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess(), mdsvex()],
	vitePlugin: {
		inspector: {
			toggleKeyCombo: 'alt-x',
			showToggleButton: 'always',
			toggleButtonPos: 'bottom-right'
		}
	},

	kit: {
		experimental: {
			remoteFunctions: true
		},
		adapter: adapter(),
		serviceWorker: {
			register: false
		},
		alias: {
			'@/*': './src/lib/components/*'
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
