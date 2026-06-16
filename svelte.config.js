import { mdsvex } from 'mdsvex';
import adapterAuto from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
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
		adapter: process.env.CAPACITOR_BUILD
			? adapterStatic({ fallback: 'index.html' })
			: adapterAuto(),
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
