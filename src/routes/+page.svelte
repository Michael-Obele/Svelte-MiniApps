<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { Welcome, Hero, Content, InfoBlocks, AppsSection } from '$lib/components/home';

	import type { PageProps } from './$types';
	import { site } from '$lib/index';
	//
	let websiteTitle = 'Svelte MiniApps';
	let websiteDescription =
		'Your everyday digital companion - a collection of beautifully crafted tools to simplify your life.';

	let { data, form }: PageProps = $props();
	import { Trophy } from '@lucide/svelte';
</script>

<div
	class="w-full border-b border-red-100 bg-red-50/80 p-1 py-2 dark:border-red-800/30 dark:bg-red-900/20"
>
	<p
		class="flex items-center justify-center space-x-2 text-center text-sm font-medium text-red-700/90 dark:text-red-200/90"
	>
		<Trophy class="h-5 w-5 text-yellow-500" />
		<span
			>Top 4 at Svelte Hack 2024! See <a href="/changelog" class="underline">Changelog</a> for details.</span
		>
	</p>
</div>

<RouteHead
	title="{websiteTitle} - Smart Tools for Modern Life"
	description={websiteDescription}
	keywords="svelte apps, web tools, productivity tools, mini applications, svelte toolkit, svelte5, offline-first, pwa"
	route="/"
	structuredData={{
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: websiteTitle,
		description: websiteDescription,
		applicationCategory: 'Productivity',
		operatingSystem: 'Any',
		author: {
			'@type': 'Person',
			name: site.author
		}
	}}
/>

<!-- Welcome Section -->
<Welcome {data} {form} />


<div class="pb-5 xl:px-10">
	<!-- Hero -->
	<Hero {data} />

	<!-- Apps Section -->
	<AppsSection />

	<!-- Info Blocks Section -->
	<InfoBlocks />

	<!-- Content Section -->
	<Content />
</div>
