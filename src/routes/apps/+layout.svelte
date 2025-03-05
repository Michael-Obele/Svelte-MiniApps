<script lang="ts">
	import RouteHead from '$lib/components/RouteHead.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<RouteHead
	title="Apps Page | Svelte MiniApps"
	description="Explore our collection of unique Svelte MiniApps. Discover new tools, innovative applications, and see how we're enhancing the Svelte ecosystem."
	keywords="Svelte, MiniApps, Apps, Tools, Applications, Ecosystem, Innovative, Unique"
	route="/apps"
	image="https://i.ibb.co/ZhhhnCz/svelte-badge.png"
/>

{@render children?.()}
