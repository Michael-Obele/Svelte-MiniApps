<script lang="ts">
	import Welcome from './Welcome.svelte';

	import Hero from './Hero.svelte';

	import Content from './Content.svelte';

	import InfoBlocks from './InfoBlocks.svelte';

	import AppsSection from './AppsSection.svelte';

	import type { ActionData, PageData } from './$types';
	import { siteimage, siteurl, sitename } from '@/index';
	import { userContext } from '@/utils';
	//
	let websiteTitle = 'Svelte MiniApps';
	let websiteDescription =
		'Your everyday digital companion - a collection of beautifully crafted tools to simplify your life.';
	let twitterTitle = `${websiteTitle} - Smart Tools for Modern Life`;
	let twitterDescription = `Discover your new favorite productivity toolkit! Beautifully designed, lightning-fast mini-apps that make everyday tasks a breeze.`;
	//
	import { invalidate } from '$app/navigation';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	$effect(() => {
		userContext.set(data?.user??null);
		$inspect('userContext.set', data?.user??null);
		invalidate('user');
		$inspect('userContext.set', userContext);
	});
</script>

<div
	class="w-full border-b border-red-100 bg-red-50/80 p-1 py-2 dark:border-red-800/30 dark:bg-red-900/20"
>
	<p class="text-center text-sm font-medium text-red-700/90 dark:text-red-200/90">
		🚧 Welcome to our new platform! Please check the changelog as we migrate features.
	</p>
</div>

<svelte:head>
	<title>{websiteTitle} - Smart Tools for Modern Life</title>
	<meta name="description" content={websiteDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={websiteTitle} />
	<meta property="og:description" content={websiteDescription} />
	<meta property="og:image" content={siteimage} />
	<meta property="og:url" content={siteurl} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={twitterTitle} />
	<meta name="twitter:description" content={twitterDescription} />
	<meta name="twitter:image" content={siteimage} />

	<!-- Additional Meta Tags -->
	<meta
		name="keywords"
		content="svelte apps, web tools, productivity tools, mini applications, svelte toolkit"
	/>
	<meta name="author" content={sitename} />
	<link rel="canonical" href={siteurl} />
</svelte:head>

<!-- Welcome Section -->
<Welcome {data} {form}/>

<div class="pb-5 xl:px-10">
	<!-- Hero -->
	<Hero {data}/>

	<!-- Apps Section -->
	<AppsSection />

	<!-- Info Blocks Section -->
	<InfoBlocks />

	<!-- Content Section -->
	<Content/>
</div>
