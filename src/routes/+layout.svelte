<script lang="ts">
	import { browser } from '$app/environment';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	import Footer from '$lib/components/blocks/Footer.svelte';
	import Navbar from '$lib/components/blocks/Navbar.svelte';
	import type { LayoutServerData } from './$types';
	import type { UserContext } from '$lib/types';
	import lottie from 'lottie-web';
	import { onMount, setContext, type Snippet } from 'svelte';
	import { page } from '$app/stores';
	import { registerServiceWorker } from '$lib/utility/serviceWorker';

	interface Props {
		data: LayoutServerData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	onMount(async () => {
		// Make onMount async
		// Dynamically import @lordicon/element *inside* onMount
		if (browser) {
			registerServiceWorker();
		}

		const { defineElement } = await import('@lordicon/element');
		defineElement(lottie.loadAnimation);
	});

</script>

<svelte:head>
	<title>Svelte MiniApps</title>
	<meta name="description" content="A collection of mini apps built with SvelteKit" />
</svelte:head>

<ModeWatcher />
<Toaster 
	expand={true}
	richColors 
	closeButton
	theme="system"
	position="top-center"
	toastOptions={{
		// Default duration of 4 seconds
		duration: 4000,
		class: 'svelte-toast', 
		style: 'background-color: var(--background); color: var(--foreground); border: 1px solid var(--border);'
	}}
/>

	<Navbar />
	<div class="min-h-screen">
		{@render children()}
	</div>
	<Footer />

<style>
	.svelte-toast {
		background-color: var(--background);
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}
	
	.svelte-toast:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
</style>
