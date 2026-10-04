import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { partytownVite } from '@builder.io/partytown/utils';
import { join } from 'path';
import tailwindcss from '@tailwindcss/vite';
import { wuchale } from '@wuchale/vite-plugin';
import lingo from 'vite-plugin-lingo';

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
		partytownVite({
			dest: join(__dirname, 'static', '~partytown')
		}),
		wuchale(),
		lingo({
			route: '/_lang' /* Route where editor UI is served */,
			localesDir: './src/locales' /* Path to .po files */
		}),

		sveltekit({
			preprocess: [vitePreprocess()],
			compilerOptions: { experimental: { async: true } },
			experimental: { remoteFunctions: true },
			adapter: adapter(),
			serviceWorker: { register: false },
			alias: { '@/*': './src/lib/components/*' },
			inspector: {
				toggleKeyCombo: 'alt-x',
				showToggleButton: 'always',
				toggleButtonPos: 'bottom-right'
			}
		})
	],
	server: {
		port: 5178,
		strictPort: false
	},
	optimizeDeps: {
		exclude: ['@node-rs/argon2']
	}
});
