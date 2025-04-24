<script lang="ts">
	import { site } from '$lib/index';

	type OpenGraphType =
		| 'website'
		| 'article'
		| 'profile'
		| 'book'
		| 'video.movie'
		| 'video.episode'
		| 'video.tv_show'
		| 'video.other'
		| 'music.song'
		| 'music.album'
		| 'music.playlist'
		| 'music.radio_station'
		| 'product';
	type TwitterCardType = 'summary' | 'summary_large_image' | 'app' | 'player';
	type LocaleType = `${string}-${string}`; // e.g., 'en-US', 'es-ES'

	interface Props {
		title: string;
		description: string;
		keywords?: string;
		route: string;
		image?: string;
		author?: string;
		canonical?: string;
		publishedTime?: string;
		modifiedTime?: string;
		type?: OpenGraphType;
		locale?: LocaleType;
		twitterCard?: TwitterCardType;
		themeColor?: string;
		noindex?: boolean;
		nofollow?: boolean;
		structuredData?: Record<string, any> | null;
	}

	let {
		title,
		description,
		route,
		keywords = '',
		image = site.image,
		author = site.author || 'Michael Obele',
		canonical = `${site.url}${route}`,
		publishedTime,
		modifiedTime,
		type = 'website',
		locale = 'en-US',
		twitterCard = 'summary_large_image',
		themeColor = site.themeColor,
		noindex = false,
		nofollow = false,
		structuredData = null
	}: Props = $props();

	let ogTitle = $derived(title);
	let ogDescription = $derived(description);
	let ogUrl = $derived(canonical);

	let robotsContent = (() => {
		const directives: string[] = [];
		if (noindex) directives.push('noindex');
		if (nofollow) directives.push('nofollow');
		return directives.length ? directives.join(', ') : 'index, follow';
	})();

	// Enrich structuredData with site-wide info if not already present
	let fullStructuredData = $derived(() => {
		if (!structuredData) return undefined;
		return {
			...structuredData,
			url: structuredData.url ?? site.url,
			image: structuredData.image ?? image,
			publisher: structuredData.publisher ?? {
				'@type': 'Organization',
				name: site.name,
				logo: { '@type': 'ImageObject', url: site.image }
			}
		};
	});
	let structuredDataJson = $derived(fullStructuredData ? JSON.stringify(fullStructuredData) : undefined);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}
	<meta name="author" content={author} />
	<meta name="robots" content={robotsContent} />
	{#if themeColor}
		<meta name="theme-color" content={themeColor} />
	{/if}
	<link rel="canonical" href={canonical} />

	<!-- Open Graph -->
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={ogUrl} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:locale" content={locale} />
	{#if image}
		<meta property="og:image" content={image} />
	{/if}
	{#if publishedTime && type === 'article'}
		<meta property="article:published_time" content={publishedTime} />
	{/if}
	{#if modifiedTime && type === 'article'}
		<meta property="article:modified_time" content={modifiedTime} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={ogDescription} />
	{#if site.twitterUsername}
		<meta name="twitter:site" content={`@${site.twitterUsername}`} />
		<meta name="twitter:creator" content={`@${site.twitterUsername}`} />
	{/if}
	{#if image}
		<meta name="twitter:image" content={image} />
	{/if}

	<!-- JSON-LD Structured Data -->
	{#if structuredDataJson}
		<script type="application/ld+json">
			{@html structuredDataJson}
		</script>
	{/if}
</svelte:head>
