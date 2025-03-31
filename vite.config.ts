import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { partytownVite } from '@builder.io/partytown/utils';
import { join } from 'path';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		// sentrySvelteKit({
		// 	sourceMapsUploadOptions: {
		// 		org: 'obele',
		// 		project: 'javascript-sveltekit'
		// 	}
		// }),
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
			strategies: 'generateSW',
			registerType: 'autoUpdate',
			scope: '/',
			base: '/',
			manifest: {
				name: "Svelte MiniApps",
				short_name: "MiniApps",
				description: "A collection of mini applications built with SvelteKit, featuring tools for productivity, finance, and utilities",
				start_url: "/",
				scope: "/",
				display: "standalone",
				background_color: "#0A0A0A",
				theme_color: "#0A0A0A", 
				orientation: "any",
				display_override: ["window-controls-overlay"],
				lang: "en-US",
				dir: "ltr",
				categories: [
					"utilities",
					"productivity",
					"finance",
					"tools",
					"education"
				],
				protocol_handlers: [
					{
						protocol: "web+miniapps",
						url: "/handle-protocol?url=%s"
					}
				],
				icons: [
					{
						src: "/favicon/favicon-96x96.png",
						sizes: "96x96",
						type: "image/png",
						purpose: "any"
					},
					{
						src: "/favicon/web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any"
					},
					{
						src: "/favicon/web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any"
					},
					{
						src: "/favicon/web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable" // Added maskable icon for better installation experience
					},
					{
						src: "/favicon/favicon.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any"
					}
				],
				screenshots: [
					{
						src: "/screenshots/home.png",
						sizes: "1920x1080",
						type: "image/png",
						form_factor: "wide",
						label: "Home screen of Svelte MiniApps"
					}
				],
				shortcuts: [
					{
						name: "Apps",
						url: "/apps",
						description: "View all mini applications"
					},
					{
						name: "Budget Tracker",
						url: "/apps/budget-tracker",
						description: "Manage your finances"
					},
					{
						name: "Currency Converter",
						url: "/apps/currency-converter",
						description: "Convert between currencies"
					},
					{
						name: "QR Code Generator",
						url: "/apps/qr-code-generator",
						description: "Generate QR codes"
					},
					{
						name: "Profile",
						url: "/profile",
						description: "View your profile"
					}
				],
				share_target: {
					action: "/share-target",
					method: "GET",
					params: {
						title: "title",
						text: "text",
						url: "url"
					}
				},
				related_applications: [
					{
						platform: "chrome_web_store",
						url: "https://svelte-mini-apps.netlify.app/manifest.json"
					}
				]
			} as const,
			injectManifest: {
				injectionPoint: undefined,
				rollupFormat: 'iife',
				globDirectory: 'static',
				additionalManifestEntries: [
					{ url: '/manifest.json', revision: Date.now().toString() }
				]
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,jpg,jpeg,json,woff,woff2}', '**/*.{html}'],
				navigateFallback: '/offline',
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https:\/\/api\.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 // 1 hour
							},
							cacheableResponse: {
								statuses: [0, 200]
							},
							networkTimeoutSeconds: 10 // Timeout after 10 seconds
						}
					},
					{
						urlPattern: /\/(?!api\/)/,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'pages-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 // 24 hours
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /\.(js|css|woff2?|svg|png|jpe?g|gif|webp)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'static-resources',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				],
				skipWaiting: true,
				clientsClaim: true
			},
			devOptions: {
				enabled: true,
				type: 'module',
				navigateFallback: '/'
			},
			kit: {
				includeVersionFile: true
			}
		}),
		enhancedImages(),
		partytownVite({
			dest: join(__dirname, 'static', '~partytown')
		})
	],
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
	},
	build: {
		rollupOptions: {
			external: ['virtual:pwa-info']
		}
	},
	server: {
		port: 5178,
		strictPort: false
	}
});
