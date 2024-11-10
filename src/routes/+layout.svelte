<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>Svelte MiniApps</title>

	<script defer src="https://cdn.lordicon.com/lordicon.js"></script>
</svelte:head>

<ModeWatcher />
<Toaster />

{@render children()}
