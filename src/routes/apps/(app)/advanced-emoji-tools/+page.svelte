<script lang="ts">
	// import type { PageData } from './$types';s
	import Construction from '$lib/assets/Construction.svelte';
	// export let data: PageData;
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

<!-- <section>
	<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="emojify-input" class="block text-green-700 dark:text-green-300">Emojify Text:</label>
	<input
		type="text"
		id="emojify-input"
		placeholder="Enter text..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	/>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600">Emojify!</button>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="find-emoji" class="block text-green-700 dark:text-green-300">Find Emoji:</label>
	<input
		type="text"
		id="find-emoji"
		placeholder="Search for emoji..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	/>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600">Find!</button>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="get-emoji" class="block text-green-700 dark:text-green-300">Get Emoji:</label>
	<input
		type="text"
		id="get-emoji"
		placeholder="Enter emoji name or shortcode..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	/>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600"
		>Get Emoji!</button
	>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="has-emoji" class="block text-green-700 dark:text-green-300">Has Emoji?</label>
	<input
		type="text"
		id="has-emoji"
		placeholder="Enter emoji or shortcode..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	/>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600">Check!</button>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="random-emoji" class="block text-green-700 dark:text-green-300">Random Emoji:</label>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600"
		>Generate Random Emoji</button
	>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="replace-emoji" class="block text-green-700 dark:text-green-300">Replace Emoji:</label>
	<textarea
		id="replace-emoji"
		rows="4"
		placeholder="Enter text with emojis..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	></textarea>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600">Replace!</button>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="search-emoji" class="block text-green-700 dark:text-green-300">Search Emojis:</label>
	<input
		type="text"
		id="search-emoji"
		placeholder="Search for emoji..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	/>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600">Search!</button>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="strip-emoji" class="block text-green-700 dark:text-green-300">Strip Emojis:</label>
	<textarea
		id="strip-emoji"
		rows="4"
		placeholder="Enter text with emojis..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	></textarea>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600">Strip!</button>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="unemojify-text" class="block text-green-700 dark:text-green-300"
		>Unemojify Text:</label
	>
	<textarea
		id="unemojify-text"
		rows="4"
		placeholder="Enter text with emojis..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	></textarea>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600"
		>Unemojify!</button
	>
	<div class="display-container mt-2"></div>
</div>

<div class="input-container bg-white p-4 dark:bg-gray-800">
	<label for="which-emoji" class="block text-green-700 dark:text-green-300">Which Emoji?</label>
	<input
		type="text"
		id="which-emoji"
		placeholder="Enter emoji..."
		class="w-full rounded border border-green-500 p-2 dark:bg-gray-700 dark:text-white"
	/>
	<button class="mt-2 rounded bg-green-500 px-4 py-2 text-white dark:bg-green-600">Identify!</button
	>
	<div class="display-container mt-2"></div>
</div>

<div class="switch-button cursor-pointer rounded bg-blue-500 p-4 text-white dark:bg-blue-700">
	Switch Mode
</div>
</section> -->
