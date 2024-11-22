<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../app.css';
	import Footer from '@/components/blocks/Footer.svelte';
	import Navbar from '@/components/blocks/Navbar.svelte';
	let { children } = $props();

	import lottie from 'lottie-web';
	import { onMount } from 'svelte';

	onMount(async () => {
		// Make onMount async
		// Dynamically import @lordicon/element *inside* onMount
		const { defineElement } = await import('@lordicon/element');
		defineElement(lottie.loadAnimation);
	});
</script>

<svelte:head>
	<title>Svelte MiniApps</title>
</svelte:head>

<ModeWatcher />
<Toaster />

<Navbar />
<div class="min-h-screen">
	{@render children()}
</div>

<Footer />
