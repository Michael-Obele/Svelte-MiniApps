<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	/** @type {Props} */
	let { children } = $props();
</script>

<RouteHead
	title="Svelte MiniApps - GitHub Contribution Tracker"
	description="Visualize your GitHub contributions in a clear and engaging way. Track streaks, identify patterns, and stay motivated."
	keywords="GitHub, Contribution Tracker, Developer Tools, Svelte Apps"
	route="/apps/github-contribution-tracker"
	image="https://svelte-apps.me/static/images/github-contribution-tracker.png"
/>

{@render children?.()}
