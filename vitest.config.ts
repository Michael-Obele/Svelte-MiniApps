import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts,svelte}'],
		globals: true,
		environment: 'jsdom',
		deps: {
			inline: ['@sveltejs/kit'],
		},
		setupFiles: ['./src/vitest-setup.ts'],
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			'@': '/src',
			$app: './vitest-mocks/app',
		},
	},
});
