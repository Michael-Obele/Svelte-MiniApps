<script>
	import Construction from '@/assets/Construction.svelte';
    import { page } from '$app/stores';
    $inspect($page.url.pathname);
</script>

<section class="p-4 text-center">
	<h3 class="mb-4 text-2xl font-bold">Under Construction</h3>
	<p class="mb-4 text-lg">We're currently working on migrating this app to a new version. Please check back later.</p>
	<p class="mb-4 text-sm">
		You can still access the <a rel="noopener" target="_blank" href="https://old.svelte-apps.me/{$page.url.pathname}" class="text-blue-500 hover:underline">previous version</a> of the app while we complete the migration.
	</p>
	<div class="mx-auto h-[50vh] w-[50vw] items-center justify-center">
		<Construction />
	</div>
</section>