<script module>
	// Define types for PWA Info
	interface PWAInfo {
		webManifest: {
			linkTag: string;
		};
		registerSW: (options?: any) => Promise<any>;
	}
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '@/ui/sonner';
	import '../app.css';
	import Footer from '$lib/components/blocks/Footer.svelte';
	import Navbar from '$lib/components/blocks/Navbar.svelte';
	import type { LayoutProps } from './$types';
	// import lottie from 'lottie-web';
	import { onMount, type Snippet } from 'svelte';
	import { partytownSnippet } from '@builder.io/partytown/integration';
	import PWA from '$lib/components/PWA.svelte';

	let { data, children }: LayoutProps = $props();
	
	// Initialize as empty strings for SSR
	let webManifestLink = $state('');
	let pwaInfoModule = $state<any>(null);
	
	// Only load PWA info in the browser
	onMount(async () => {
		if (browser) {
			try {
				// Dynamically import the virtual module
				const pwaInfo = await import('virtual:pwa-info');
				pwaInfoModule = pwaInfo;
				
				if (pwaInfo && pwaInfo.pwaInfo) {
					// Update web manifest link
					webManifestLink = pwaInfo.pwaInfo.webManifest.linkTag || '';
					
					// Register service worker if available
					if (pwaInfo.pwaInfo.registerSW) {
						pwaInfo.pwaInfo.registerSW();
					}
				}
			} catch (error) {
				console.error('Failed to load PWA info:', error);
			}
		}

		const lottie = (await import('lottie-web')).default;
		const { defineElement } = await import('@lordicon/element');
		defineElement(lottie.loadAnimation);
	});
</script>

<svelte:head>
	<title>Svelte MiniApps</title>
	<meta name="description" content="A collection of mini apps built with SvelteKit" />
	
	<!-- PWA web manifest link (auto-injected by vite-pwa) -->
	{@html webManifestLink || ''}

	<script>
		// Forward the necessary functions to the web worker layer
		partytown = {
			forward: ['dataLayer.push', 'gtag']
		};
	</script>

	{@html '<script>' + partytownSnippet() + '</script>'}
	<!-- Google tag (gtag.js) -->
	<script
		type="text/partytown"
		src="https://www.googletagmanager.com/gtag/js?id=G-Q6RH7QGJDV"
	></script>
	<script type="text/partytown">
		window.dataLayer = window.dataLayer || [];
		window.gtag = function () {
			dataLayer.push(arguments);
		};
		gtag('js', new Date());
		gtag('config', 'G-Q6RH7QGJDV');
	</script>
</svelte:head>

<ModeWatcher />
<Toaster
	expand={true}
	richColors
	theme="system"
	position="top-center"
	toastOptions={{
		// Default duration of 4 seconds
		duration: 4000,
		style:
			'background-color: var(--background); color: var(--foreground); border: 1px solid var(--border);'
	}}
/>

<Navbar />
<div class="min-h-screen">
	{@render children()}
</div>
<Footer />
{#if browser}
	<PWA />
{/if}
