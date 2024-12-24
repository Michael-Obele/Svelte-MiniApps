<script lang="ts">
	import Construction from '@/assets/Construction.svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	let { link = true }: { link?: boolean } = $props();

	let visible = $state(false);
	setTimeout(() => {
		visible = true;
	}, 1000);
</script>

<section class="container mx-auto px-4 py-16 text-center">
	<div class="mx-auto max-w-2xl space-y-6" transition:fade={{ duration: 300 }}>
		<h3 class="text-3xl font-bold text-gray-900 dark:text-white">🚧 We're Making Improvements</h3>

		<p class="text-lg text-gray-600 dark:text-gray-300">
			We're upgrading this app to bring you an even better experience. Our team is working hard to
			add new features and improvements.
		</p>

		{#if link}
			<p class="text-sm text-gray-500 dark:text-gray-400">
				In the meantime, you can continue using the
				<a
					href="https://old.svelte-apps.me/{$page.url.pathname}"
					class="text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
				>
					current version
				</a>
				with all its existing features.
			</p>
		{/if}
		{#if visible}
			<div class="relative mx-auto mt-8 h-[400px] w-full max-w-xl" transition:fade>
				<div
					class="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-transparent opacity-50"
				></div>
				<Construction />
			</div>
		{/if}
	</div>
</section>
