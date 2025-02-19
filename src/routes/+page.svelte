<script lang="ts">
	import Welcome from './Welcome.svelte';

	import Hero from './Hero.svelte';

	import Content from './Content.svelte';

	import InfoBlocks from './InfoBlocks.svelte';

	import AppsSection from './AppsSection.svelte';

	import type { PageProps } from './$types';
	import { site } from '@/index';
	import { userContext } from '@/utils';
	//
	let websiteTitle = 'Svelte MiniApps';
	let websiteDescription =
		'Your everyday digital companion - a collection of beautifully crafted tools to simplify your life.';
	let twitterTitle = `${websiteTitle} - Smart Tools for Modern Life`;
	let twitterDescription = `Discover your new favorite productivity toolkit! Beautifully designed, lightning-fast mini-apps that make everyday tasks a breeze.`;

	let { data, form }: PageProps = $props();
	import { Trophy } from 'lucide-svelte';

	$effect(() => {
		userContext.set(data?.user ?? null);
		// Reload the page once when coming from the login page or register page
		if (document.referrer.includes('/login') || document.referrer.includes('/register')) {
			console.log('Reloading page');
			window.location.reload();
		}
	});
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

<svelte:head>
	<title>{websiteTitle} - Smart Tools for Modern Life</title>
	<meta name="description" content={websiteDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={websiteTitle} />
	<meta property="og:description" content={websiteDescription} />
	<meta property="og:image" content={site.image} />
	<meta property="og:url" content={site.url} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={twitterTitle} />
	<meta name="twitter:description" content={twitterDescription} />
	<meta name="twitter:image" content={site.image} />

	<!-- Additional Meta Tags -->
	<meta
		name="keywords"
		content="svelte apps, web tools, productivity tools, mini applications, svelte toolkit"
	/>
	<meta name="author" content={site.name} />
	<link rel="canonical" href={site.url} />
</svelte:head>

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
