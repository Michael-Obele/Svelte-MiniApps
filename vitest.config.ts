import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/vitest-setup.ts']
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			'@': '/src',
			$app: './vitest-mocks/app'
		}
	}
});
