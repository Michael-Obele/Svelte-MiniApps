<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Apps Page | Svelte MiniApps</title>
	<meta
		name="description"
		content="Explore our collection of unique Svelte MiniApps. Discover new tools, innovative applications, and see how we're enhancing the Svelte ecosystem."
	/>
	<meta
		name="keywords"
		content="Svelte, MiniApps, Apps, Tools, Applications, Ecosystem, Innovative, Unique"
	/>
	<meta property="og:title" content="Apps Page | Svelte MiniApps" />
	<meta
		property="og:description"
		content="Explore our collection of unique Svelte MiniApps. Discover new tools, innovative applications, and see how we're enhancing the Svelte ecosystem."
	/>
	<meta property="og:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<meta property="og:url" content="https://svelte-apps.me/apps" />
	<meta property="og:url" content="https://svelte-apps.me/apps" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Apps Page | Svelte MiniApps" />
	<meta
		name="twitter:description"
		content="Explore our collection of unique Svelte MiniApps. Discover new tools, innovative applications, and see how we're enhancing the Svelte ecosystem."
	/>
	<meta name="twitter:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<link rel="canonical" href="https://svelte-apps.me/apps" />
</svelte:head>

{@render children?.()}
