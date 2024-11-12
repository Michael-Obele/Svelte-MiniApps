<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../app.css';
	import Footer from '@/components/blocks/footer.svelte';
	import Navbar from '@/components/blocks/navbar.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<title>Svelte MiniApps</title>

	<script defer src="https://cdn.lordicon.com/lordicon.js"></script>
</svelte:head>

<ModeWatcher />
<Toaster />

<Navbar />
<div class="min-h-screen">
	{@render children()}
</div>

<Footer />
