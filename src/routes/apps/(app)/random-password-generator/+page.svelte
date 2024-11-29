<script lang="ts">
	import Construction from '@/assets/Construction.svelte';
	import { siteimage, siteurl, sitename } from '$lib';
</script>

<svelte:head>
	<title>Svelte MiniApps - Password Generator</title>
	<meta
		name="description"
		content="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	/>
	<meta property="og:title" content="Svelte MiniApps - Password Generator" />
	<meta
		property="og:description"
		content="Generates random passwords with configurable length and complexity. Secure your accounts with ease."
	/>
	<meta property="og:url" content="https://svelte-apps.me/apps/password-generator" />
	<meta property="og:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Svelte MiniApps - Password Generator - Secure Your Accounts"
	/>
	<meta
		name="twitter:description"
		content="Generate strong, random passwords with ease using the Svelte MiniApps Random Password Generator."
	/>
	<meta name="twitter:image" content="https://i.ibb.co/ZhhhnCz/svelte-badge.png" />

	<link rel="canonical" href="https://svelte-apps.me/apps/password-generator" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta charset="UTF-8" />
	<meta name="robots" content="index, follow" />
	<script type="application/ld+json">
		{
			"@context": "http://schema.org",
			"@type": "WebApplication",
			"name": "Svelte MiniApps - Password Generator",
			"url": "https://svelte-apps.me/apps/password-generator",
			"description": "Generates random passwords with configurable length and complexity. Secure your accounts with ease."
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


