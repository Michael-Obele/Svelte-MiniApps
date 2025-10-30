<script lang="ts">
	import * as Breadcrumb from '@/ui/breadcrumb/index.js';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let route = $derived(page.url.pathname.split('/'));
	let currentRoute = $derived(route[route.length - 1]);

	// Determine the current page title based on the route
	const getPageTitle = (route: string) => {
		switch (route) {
			case 'timeline':
				return 'Timeline';
			case 'announcements':
				return 'Announcements';
			case 'planned-features':
				return 'Planned Features';
			default:
				return 'Changelog';
		}
	};
</script>

<div class="flex items-start justify-center p-1">
	<div class="relative mt-2 mb-5 flex place-items-center justify-center">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					{#if currentRoute === 'changelog'}
						<Breadcrumb.Page>Changelog</Breadcrumb.Page>
					{:else}
						<Breadcrumb.Link href="/changelog">Changelog</Breadcrumb.Link>
					{/if}
				</Breadcrumb.Item>
				{#if currentRoute !== 'changelog'}
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Page class="capitalize">{getPageTitle(currentRoute)}</Breadcrumb.Page>
					</Breadcrumb.Item>
				{/if}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</div>

<div class="relative mt-6 min-h-screen" transition:fade={{ duration: 150 }}>
	{@render children?.()}
</div>
