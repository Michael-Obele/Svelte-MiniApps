import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { partytownVite } from '@builder.io/partytown/utils';
import { join } from 'path';
import tailwindcss from '@tailwindcss/vite';

// export default defineConfig({
// 	plugins: [sveltekit(), enhancedImages()],
// 	server: {
// 		port: 5178,
// 		strictPort: false
// 	}
// });

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
		sveltekit()
	],
	server: {
		port: 5178,
		strictPort: false
	}
});
