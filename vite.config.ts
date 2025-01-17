import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { partytownVite } from '@builder.io/partytown/utils';
import { join } from 'path';

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
		sveltekit(),
		enhancedImages(),
		partytownVite({
			dest: join(__dirname, 'static', '~partytown')
		})
	],
	server: {
		port: 5178,
		strictPort: false
	}
});
