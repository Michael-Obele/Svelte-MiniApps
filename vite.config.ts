import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import GitRevision  from 'vite-plugin-git-revision';


export default defineConfig({
	plugins: [sveltekit(),
		GitRevision({}),
	],
	server: {
		port: 5178,
		strictPort: false
	}
});
