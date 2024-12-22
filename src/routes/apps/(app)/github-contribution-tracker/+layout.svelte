<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	/** @type {Props} */
	let { children } = $props();
</script>

<svelte:head>
	<title>Svelte MiniApps - GitHub Contribution Tracker</title>
	<meta
		name="description"
		content="Visualize your GitHub contributions in a clear and engaging way. Track streaks, identify patterns, and stay motivated."
	/>
	<meta property="og:title" content="Svelte MiniApps - GitHub Contribution Tracker" />
	<meta
		property="og:description"
		content="Visualize your GitHub contributions in a clear and engaging way. Track streaks, identify patterns, and stay motivated."
	/>
	<meta property="og:url" content="https://svelte-apps.me/apps/github-contribution-tracker" />
	<meta
		property="og:image"
		content="https://svelte-apps.me/static/images/github-contribution-tracker.png"
	/>
	<link rel="canonical" href="https://svelte-apps.me/apps/github-contribution-tracker" />
	<meta
		name="twitter:title"
		content="Svelte MiniApps - GitHub Contribution Tracker - Track Your GitHub Journey"
	/>
	<meta name="keywords" content="GitHub, Contribution Tracker, Developer Tools, Svelte Apps" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:description"
		content="Gain insights into your GitHub activity with the Svelte MiniApps Contribution Tracker. Visualize progress and stay engaged!"
	/>
	<meta
		name="twitter:image"
		content="https://svelte-apps.me/static/images/github-contribution-tracker.png"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="UTF-8" />
	<meta name="robots" content="index, follow" />
	<script type="application/ld+json">
		{
			"@context": "http://schema.org",
			"@type": "WebSite",
			"name": "Svelte MiniApps - GitHub Contribution Tracker",
			"url": "https://svelte-apps.me/apps/github-contribution-tracker",
			"description": "Visualize your GitHub contributions in a clear and engaging way. Track streaks, identify patterns, and stay motivated."
		}
	</script>
</svelte:head>

{@render children?.()}
