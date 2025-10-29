<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import { Welcome, Hero, Content, InfoBlocks, AppsSection, Banner } from '$lib/components/home';

	import type { PageProps } from './$types';
	import { site } from '$lib/index';
	//
	let websiteTitle = 'Svelte Mini Apps';
	let websiteDescription =
		'Your everyday digital companion - a collection of beautifully crafted tools to simplify your life.';

	let { data }: PageProps = $props();
</script>

<Banner />

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
<Welcome {data} />

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
