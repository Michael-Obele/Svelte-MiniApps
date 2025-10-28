<!-- src/routes/social-links/[id]/+page.svelte -->
<script lang="ts">
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let urls = data.urls;
</script>

<RouteHead
	title="Social Links"
	description="Access all your social media profiles in one place"
	keywords="social links, profile"
	route="/social-links/[id]"
/>

<div
	class="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 px-4 py-8 dark:from-gray-900 dark:to-gray-800"
>
	<div class="mx-auto max-w-md space-y-8">
		<div class="space-y-2 text-center">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Your Social Links</h1>
			<p class="text-gray-500 dark:text-gray-400">
				Access all your social media profiles in one place
			</p>
		</div>

		<div class="space-y-4">
			{#each urls as url (url)}
				<a
					href={url}
					class="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
					target="_blank"
					rel="noopener noreferrer"
				>
					<div class="mb-1 font-semibold text-gray-900 dark:text-white">
						{url}
					</div>
				</a>
			{/each}
		</div>

		<div class="text-center text-sm text-gray-500 dark:text-gray-400">
			Created with Svelte MiniApps
		</div>
	</div>
</div>
