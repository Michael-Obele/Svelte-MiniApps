<script lang="ts">
	import { browser } from '$app/environment';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '@/ui/sonner';
	import '../app.css';
	import Footer from '$lib/components/blocks/Footer.svelte';
	import Navbar from '$lib/components/blocks/Navbar.svelte';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import type { LayoutProps } from './$types';
	// import lottie from 'lottie-web';
	import { onMount, type Snippet } from 'svelte';
	import { registerServiceWorker } from '$lib/utility/serviceWorker';
	import { Runatics } from 'runatics';

	// Import language store initialization
	import { initLanguage } from '$lib/stores/language-store.svelte';

	let { children, data }: LayoutProps = $props();
	let { user, ANALYTICS_ID } = data;

	onMount(async () => {
		// Dynamically import @lordicon/element *inside* onMount
		if (browser) {
			registerServiceWorker();
			// Initialize language settings
			initLanguage();
		}
		const { defineElement } = await import('@lordicon/element');
		defineElement();
	});
</script>

<RouteHead title="Svelte Mini Apps" description="A collection of mini apps built with SvelteKit" />

<!-- <Runatics {analyticsId} /> -->
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
