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
		// sentrySvelteKit({
		// 	sourceMapsUploadOptions: {
		// 		org: 'obele',
		// 		project: 'javascript-sveltekit'
		// 	}
		// }),
		tailwindcss(),
		enhancedImages(),
		partytownVite({
			dest: join(__dirname, 'static', '~partytown')
		}),
		wuchale(),
		lingo({
			route: '/_lang', // Route where editor UI is served
			localesDir: './src/locales' // Path to .po files
		}),
		sveltekit()
	],
	server: {
		port: 5178,
		strictPort: false
	},
	ssr: {
		noExternal: []
	},
	optimizeDeps: {
		exclude: ['@node-rs/argon2']
	}
});
