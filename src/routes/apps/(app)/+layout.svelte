<script lang="ts">
	import * as Breadcrumb from '@/ui/breadcrumb/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Badge } from '@/ui/badge/index.js';
	import { page } from '$app/state';
	import { CodeXml } from '@lucide/svelte';
	import { fade } from 'svelte/transition';
	import { PanelRightOpen, Keyboard } from '@lucide/svelte';
	import AppTracker from '@/blocks/AppTracker.svelte';
	import { done } from '$lib/index';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import RouteHead from '$lib/components/blocks/RouteHead.svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let route = $derived(page.url.pathname.split('/'));
	let routeId = $derived(route[2]);
	let currentRoute = $derived(route[route.length - 1]);

	let link = 'https://github.com/Michael-Obele/Svelte-MiniApps/tree/master/src/routes/apps/(app)';
	let isSheetOpen = $state(false);

	// Function to toggle the sheet
	function toggleSheet() {
		isSheetOpen = !isSheetOpen;
	}

	// Handle keyboard shortcut (Alt+A for "Apps")
	function handleKeyDown(event: KeyboardEvent) {
		if (event.altKey && event.key === 'd') {
			event.preventDefault();
			toggleSheet();
		}
	}

	// Function to navigate to an app and close the sheet
	function navigateToApp(appPath: string) {
		// Close the sheet
		isSheetOpen = false;

		// Use a small timeout to ensure the sheet starts closing before navigation
		setTimeout(() => {
			goto(`/apps/${appPath}`);
		}, 100);
	}

	onMount(() => {
		// Add keyboard event listener when component mounts
		window.addEventListener('keydown', handleKeyDown);

		// Cleanup when component unmounts
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<!-- <RouteHead
	title="Apps Page | Svelte MiniApps"
	description="Explore our collection of unique Svelte MiniApps. Discover new tools, innovative applications, and see how we're enhancing the Svelte ecosystem."
	keywords="Svelte, MiniApps, Mini Apps, Apps, Tools, Applications, Ecosystem, Innovative, Unique"
	route="/apps"
	image="https://i.ibb.co/ZhhhnCz/svelte-badge.png"
/> -->

{#if currentRoute && currentRoute !== 'apps'}
	<AppTracker appLink={currentRoute} />
{/if}

<div class="flex items-start justify-between p-1">
	<div class="relative mt-2 mb-5 flex place-items-center justify-center">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/apps">Apps</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>
					{#if routeId == currentRoute}
						<Breadcrumb.Page class="capitalize">{routeId}</Breadcrumb.Page>
					{:else}
						<Breadcrumb.Link class="capitalize" href="/apps/{routeId.toLowerCase()}"
							>{routeId.toLowerCase()}</Breadcrumb.Link
						>
					{/if}
					<Badge variant="secondary" href="{link}/{routeId.toLowerCase()}" target="_blank" class="">
						<span class="hidden sm:inline"> View Source Code </span>
						<CodeXml size="16" class="sm:mx-1" />
					</Badge>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
	<div>
		<!-- Empty for layout -->
	</div>

	<Sheet.Root bind:open={isSheetOpen}>
		<Sheet.Trigger class="hover:bg-muted order-first mt-2 rounded-md transition-colors">
			<div class="flex items-center gap-1">
				<PanelRightOpen class="size-5" />
				<span class="sr-only">Open apps menu</span>
				<div class="text-muted-foreground hidden items-center text-xs md:flex">
					<Keyboard class="mr-1 h-3 w-3" />
					<span>Alt+D</span>
				</div>
			</div>
		</Sheet.Trigger>
		<Sheet.Content class="w-[300px] sm:w-[400px]">
			<Sheet.Header class="pb-4">
				<Sheet.Title class="text-xl font-semibold">Available Apps</Sheet.Title>
				<Sheet.Description class="text-muted-foreground text-sm">
					Explore our collection of interactive mini applications built with Svelte.
					<div class="border-muted bg-muted/30 mt-2 space-y-1.5 rounded-md border p-2 text-xs">
						<div class="flex items-center gap-1">
							<kbd class="bg-background rounded px-1.5 py-0.5 text-xs font-medium">Alt</kbd>
							<span>+</span>
							<kbd class="bg-background rounded px-1.5 py-0.5 text-xs font-medium">D</kbd>
							<span class="text-muted-foreground ml-1.5">Toggle this menu</span>
						</div>
						<div class="flex items-center gap-1">
							<kbd class="bg-background rounded px-1.5 py-0.5 text-xs font-medium">Tab</kbd>
							<span class="text-muted-foreground ml-1.5">Navigate forward</span>
						</div>
						<div class="flex items-center gap-1">
							<kbd class="bg-background rounded px-1.5 py-0.5 text-xs font-medium">Shift</kbd>
							<span>+</span>
							<kbd class="bg-background rounded px-1.5 py-0.5 text-xs font-medium">Tab</kbd>
							<span class="text-muted-foreground ml-1.5">Navigate backwards</span>
						</div>
						<div class="flex items-center gap-1">
							<kbd class="bg-background rounded px-1.5 py-0.5 text-xs font-medium">Enter</kbd>
							<span class="text-muted-foreground ml-1.5">Open selected app</span>
						</div>
					</div>
				</Sheet.Description>
			</Sheet.Header>
			<div class="flex flex-col gap-2 overflow-y-auto py-4" style="max-height: calc(80vh - 150px);">
				{#each done as app}
					<Sheet.Description>
						<!-- Updated to use the navigateToApp function -->
						<button
							class="hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-left"
							onclick={() => navigateToApp(app.name)}
						>
							<div class="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
								<span class="text-primary text-xs font-medium"
									>{app.name.charAt(0).toUpperCase()}</span
								>
							</div>
							<span class="capitalize">{app.name.replace(/-/g, ' ')}</span>
						</button>
					</Sheet.Description>
				{/each}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>

<div class="relative mt-6 min-h-screen" transition:fade={{ duration: 150 }}>
	{@render children?.()}
</div>
