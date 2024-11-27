<script lang="ts">
	import Construction from '$lib/assets/Construction.svelte';
	import { siteimage, siteurl, sitename } from '$lib';
</script>

<svelte:head>
	<title>Advanced Emoji Tools</title>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta
		name="description"
		content="An advanced toolset for working with emojis. Convert text to emojis, search for emojis, and more."
	/>
	<link rel="canonical" href="{siteurl}apps/advanced-emoji-tools" />

	<!-- Social Media / Open Graph Meta Tags -->
	<meta property="og:title" content="Advanced Emoji Tools" />
	<meta property="og:description" content="Convert text to emojis, search for emojis, and more." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{siteurl}apps/advanced-emoji-tools" />
	<meta property="og:image" content={siteimage} />
	<meta property="og:site_name" content={sitename} />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card Data -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@YourTwitterHandle" />
	<!-- Replace with your Twitter handle -->
	<meta name="twitter:creator" content="@YourTwitterHandle" />
	<!-- Replace with your Twitter handle -->
	<meta name="twitter:title" content="Advanced Emoji Tools" />
	<meta name="twitter:description" content="Convert text to emojis, search for emojis, and more." />
	<meta name="twitter:image" content={siteimage} />

	<!--  Schema.org for Google -->
	<script type="application/ld+json">
		{
			`{
				"@context": "https://schema.org",
				"@type": "WebPage",
				"name": "Advanced Emoji Tools",
				"description": "Convert text to emojis, search for emojis, and more.",
				"url": "${siteurl}apps/advanced-emoji-tools",
				"image": "${siteimage}"
			}`
		}
	</script>
</svelte:head>

<section class="p-4 text-center">
	<h3 class="mb-4 text-2xl font-bold">Under Construction</h3>
	<p class="mb-4 text-lg">We're currently working on this App. Please check back later.</p>
	<div class="mx-auto h-[50vh] w-[50vw] items-center justify-center">
		<Construction />
	</div>
</section>