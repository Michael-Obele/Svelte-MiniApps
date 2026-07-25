<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import {
		AppsSection,
		Banner,
		FAQ,
		FinalCTA,
		Hero,
		HowItWorks,
		InfoBlocks,
		LivePreview,
		SocialProof,
		ValueBar,
		Welcome
	} from '$lib/components/home';

	import type { PageProps } from './$types';
	import { site } from '$lib/index.svelte';

	let websiteTitle = 'Svelte Mini Apps';
	let websiteDescription =
		'20+ free mini apps for budgets, passwords, QR codes, notes and more. No sign-up. Offline-ready. Open source.';

	let { data }: PageProps = $props();
</script>

<Banner />

<RouteHead
	title="{websiteTitle} - {20}+ free tools, no sign-up, works offline"
	description={websiteDescription}
	keywords="svelte apps, web tools, productivity tools, mini applications, svelte toolkit, svelte5, offline-first, pwa, free, open source"
	route="/"
	structuredData={{
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: websiteTitle,
		description: websiteDescription,
		applicationCategory: 'Productivity',
		operatingSystem: 'Any',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		author: {
			'@type': 'Person',
			name: site().author
		}
	}}
/>

<!-- Welcome (personal greeting + "where to start?" row) -->
<Welcome {data} />

<div class="pb-5 xl:px-10">
	<!-- Hero (outcome-led headline, dual CTAs, product visual) -->
	<Hero {data} />

	<!-- How it works (3-step goal gradient) -->
	<HowItWorks />

	<!-- Live preview (reciprocity: try a tool right here) -->
	<LivePreview />

	<!-- Apps (featured + active + coming soon) -->
	<AppsSection />

	<!-- Value bar (contrast effect: $0 vs $180/yr competitor) -->
	<ValueBar />

	<!-- Social proof (stats + community quotes) -->
	<!-- <SocialProof /> -->

	<!-- Info blocks (preserved — product story / values) -->
	<InfoBlocks />

	<!-- FAQ (objection handling) -->
	<FAQ />

	<!-- Final CTA (replaces Content's "Join the Journey") -->
	<FinalCTA />
</div>
