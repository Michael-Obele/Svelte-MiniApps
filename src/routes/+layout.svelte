<script module lang="ts">
	// Define type for PWA web manifest
	interface WebManifest {
		linkTag: string;
		href: string;
		useCredentials: boolean;
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
	import { onMount } from 'svelte';
	import { partytownSnippet } from '@builder.io/partytown/integration';
	import PWA from '$lib/components/PWA.svelte';

	let { data, children }: LayoutProps = $props();
	
	// For PWA web manifest
	let webManifestLink = $state('');
	
	onMount(async () => {
		if (browser) {
			try {
				// Dynamically import the PWA virtual module
				const pwaInfoModule = await import('virtual:pwa-info');
				
				if (pwaInfoModule.pwaInfo) {
					// Set the web manifest link for the head
					webManifestLink = pwaInfoModule.pwaInfo.webManifest.linkTag || '';
				}
			} catch (error) {
				console.error('Failed to load PWA info:', error);
			}
		}

		// Load Lordicon element
		const lottie = (await import('lottie-web')).default;
		const { defineElement } = await import('@lordicon/element');
		defineElement(lottie.loadAnimation);
	});
</script>

<svelte:head>
	<title>Svelte MiniApps</title>
	<meta name="description" content="A collection of mini apps built with SvelteKit" />
	<meta name="theme-color" content="#0A0A0A" />
	<meta name="viewport" content="width=device-width,initial-scale=1" />
	
	<!-- PWA web manifest -->
	{@html webManifestLink}

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

<!-- Only load PWA component in the browser -->
{#if browser}
	<PWA />
{/if}
